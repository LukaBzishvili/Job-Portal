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
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Job } from '../models/firestore';

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
}
