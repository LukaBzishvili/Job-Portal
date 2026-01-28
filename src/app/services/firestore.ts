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
  writeBatch,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { Company, Job, RegisterWithCompanyPayload, User } from '../models/firestore';
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

  async listJobsForCurrentCompany(): Promise<Job[]> {
    const profile = await this.getCurrentUserProfile();
    const companyId = (profile as any)?.companyId;

    if (!companyId) return [];

    const q = query(
      this.jobsListRef(),
      where('companyId', '==', companyId),
      // orderBy('createdAt', 'desc'),
    );

    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data() as Omit<Job, 'id'>;
      return { id: d.id, ...data };
    });
  }

  async getCurrentCompany(): Promise<Company | null> {
    const profile = await this.getCurrentUserProfile();
    const companyId = (profile as any)?.companyId;

    if (!companyId) return null;

    const snap = await getDoc(this.companyDocRef(companyId));
    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...(snap.data() as Omit<Company, 'id'>),
    };
  }

  async getCurrentCompanyId(): Promise<string | null> {
    const profile = await this.getCurrentUserProfile();
    const companyId = (profile as any)?.companyId;
    return companyId ?? null;
  }

  async updateCurrentCompany(data: any) {
    const companyId = await this.getCurrentCompanyId();
    if (!companyId) throw new Error('No companyId linked to this user');

    const ref = this.companyDocRef(companyId);

    const cleaned = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

    return updateDoc(ref, {
      ...cleaned,
      updatedAt: serverTimestamp(),
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

  getSpecificJob(jobId: string): Promise<Job | null> {
    const jobRef = doc(db, 'Jobs', 'Cards', 'list', jobId);
    return getDoc(jobRef).then((snap) => {
      if (!snap.exists()) return null;
      return { id: snap.id, ...(snap.data() as Omit<Job, 'id'>) };
    });
  }

  private companyDocRef(companyId: string) {
    return doc(db, 'companies', companyId);
  }

  async listCompanies(): Promise<Company[]> {
    const q = query(collection(db, 'companies'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data() as Omit<Company, 'id'>;
      return { id: d.id, ...data };
    });
  }

  async registerUserWithOptionalCompany(uid: string, payload: RegisterWithCompanyPayload) {
    const batch = writeBatch(db);

    const userRef = this.userDocRef(uid);

    const isCompany = payload.accountType === 'company';
    const companyId = isCompany ? uid : null;
    const companyRef = isCompany ? this.companyDocRef(uid) : null;

    batch.set(userRef, {
      fullName: payload.fullName,
      email: payload.email,
      phoneNumber: payload.phoneNumber ?? null,
      photoURL: null,

      role: 'user',

      accountType: payload.accountType,
      companyId: companyId,

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

    if (isCompany) {
      const companyName = (payload.companyName ?? '').trim();
      if (!companyName) {
        throw new Error('companyName is required for company accounts');
      }

      batch.set(companyRef!, {
        name: companyName,
        ownerUid: uid,

        website: null,
        logoURL: null,
        industry: null,
        size: null,
        description: null,
        location: {
          country: null,
          city: null,
        },

        verified: false,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
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

  async applyToJob(jobId: string) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const jobRef = doc(db, 'Jobs', 'Cards', 'list', jobId);
    const userRef = doc(db, 'users', user.uid);

    const batch = writeBatch(db);

    batch.update(jobRef, {
      applicants: arrayUnion(user.uid),
      updatedAt: serverTimestamp(),
    });

    batch.update(userRef, {
      appliedJobs: arrayUnion(jobId),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
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
