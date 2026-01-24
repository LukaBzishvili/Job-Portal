import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  query,
  orderBy,
  limit,
  getDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { Job, User } from '../models/firestore';
import { ParamMap } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Firestore {
  async listFilters() {
    const snap = await getDocs(collection(db, 'filters'));
    // console.log(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async listJobs(): Promise<Job[]> {
    const snap = await getDocs(this.jobsListRef());

    return snap.docs.map((d) => {
      const data = d.data() as Omit<Job, 'id'>;
      return { id: d.id, ...data };
    });
  }

  async listMainPageJobs(): Promise<Job[]> {
    const q = query(this.jobsListRef(), orderBy('createdAt', 'desc'), limit(3));

    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data() as Omit<Job, 'id'>;
      return { id: d.id, ...data };
    });
  }

  async listJobsByQueryParams(map: ParamMap): Promise<Job[]> {
    const jobFunctions = map.getAll('JobFunctions').map((v) => v.toLowerCase());
    const experience = map.getAll('ExperienceLevel').map((v) => v.toLowerCase());
    const jobType = map.getAll('JobType').map((v) => v.toLowerCase());
    const workMode = map.getAll('WorkMode').map((v) => v.toLowerCase());

    const q = (map.get('q') ?? '').trim().toLowerCase();
    const locationQ = (map.get('location') ?? '').trim().toLowerCase();

    const salaryRangeRaw = map.getAll('SalaryRange');
    const [minSalary, maxSalary] = this.parseSalaryRange(salaryRangeRaw);

    const hasAnyFilter =
      jobFunctions.length ||
      experience.length ||
      jobType.length ||
      workMode.length ||
      minSalary != null ||
      maxSalary != null ||
      !!q ||
      !!locationQ;

    const allJobs = await this.listJobs();
    if (!hasAnyFilter) return allJobs;

    return allJobs.filter((job) => {
      const jf = (job.jobFunction ?? '').toString().toLowerCase();
      const exp = (job.experienceLevel ?? '').toString().toLowerCase();
      const jt = (job.jobType ?? '').toString().toLowerCase();
      const wm = (job.workMode ?? '').toString().toLowerCase();

      const matchesJobFunction = !jobFunctions.length || jobFunctions.includes(jf);
      const matchesExperience = !experience.length || experience.includes(exp);
      const matchesJobType = !jobType.length || jobType.includes(jt);
      const matchesWorkMode = !workMode.length || workMode.includes(wm);

      const jobSalaryNum =
        typeof job.salary === 'number'
          ? job.salary
          : Number(String(job.salary).replace(/[^\d.]/g, ''));

      const hasSalaryFilter = minSalary != null || maxSalary != null;
      const matchesSalary =
        !hasSalaryFilter ||
        (Number.isFinite(jobSalaryNum) &&
          (minSalary == null || jobSalaryNum >= minSalary) &&
          (maxSalary == null || jobSalaryNum <= maxSalary));

      const title = (job.title ?? '').toString().toLowerCase();
      const company = (job.company ?? '').toString().toLowerCase();
      const matchesSearch = !q || title.includes(q) || company.includes(q);

      const loc = (job.companyLocation ?? (job as any).location ?? '').toString().toLowerCase();
      const matchesLocation = !locationQ || loc.includes(locationQ);

      return (
        matchesJobFunction &&
        matchesExperience &&
        matchesJobType &&
        matchesWorkMode &&
        matchesSalary &&
        matchesSearch &&
        matchesLocation
      );
    });
  }

  parseSalaryRange(values: string[]): [number | null, number | null] {
    if (!values?.length) return [null, null];

    if (values.length >= 2 && this.isFiniteNumber(values[0]) && this.isFiniteNumber(values[1])) {
      return [Number(values[0]), Number(values[1])];
    }

    const joined = values.join(',');
    const m = joined.match(/(\d+)\s*[-,]\s*(\d+)/);
    if (m) return [Number(m[1]), Number(m[2])];

    if (values.length === 1 && this.isFiniteNumber(values[0])) return [Number(values[0]), null];

    return [null, null];
  }

  isFiniteNumber(v: any) {
    const n = Number(v);
    return Number.isFinite(n);
  }

  private jobsListRef() {
    return collection(db, 'Jobs', 'Cards', 'list');
  }

  async addJob(job: Omit<Job, 'createdAt' | 'updatedAt'>) {
    return addDoc(this.jobsListRef(), {
      ...job,
      applicants: job.applicants ?? [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async setJob(jobId: string, job: Omit<Job, 'createdAt' | 'updatedAt'>) {
    const jobRef = doc(db, 'Jobs', 'Cards', 'list', jobId);
    return setDoc(jobRef, {
      ...job,
      applicants: job.applicants ?? [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async addApplicant(jobId: string, userId: string) {
    const jobRef = doc(db, 'Jobs', 'Cards', 'list', jobId);
    return updateDoc(jobRef, {
      applicants: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });
  }

  // Users
  private userDocRef(uid: string) {
    return doc(db, 'users', uid);
  }

  async addUser(
    uid: string,
    data: {
      fullName: string;
      email: string;
      phoneNumber?: number;
    },
  ) {
    const userRef = doc(db, 'users', uid);

    return setDoc(userRef, {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber ?? null,
      photoURL: null,

      role: 'user',
      isEmailVerified: false,
      isProfileComplete: false,

      jobTitle: null,
      experienceLevel: null,
      yearsOfExperience: null,
      skills: [],

      location: {
        country: null,
        city: null,
        timezone: null,
      },

      workPreferences: {
        remote: false,
        hybrid: false,
        onsite: false,
      },

      resumeURL: null,
      portfolioURL: null,
      linkedinURL: null,
      githubURL: null,

      savedJobs: [],
      appliedJobs: [],

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async updateUser(uid: string, data: Partial<User>) {
    const userRef = this.userDocRef(uid);

    return updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async getCurrentUserProfile(): Promise<User | null> {
    const user = auth.currentUser;
    if (!user) {
      console.log('user does not exist');
      return null;
    }

    const ref = doc(db, 'users', user.uid);
    // console.log(user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.log('snap does not exist ');
      return null;
    }

    return {
      id: snap.id,
      ...(snap.data() as Omit<User, 'id'>),
    };
  }
}
