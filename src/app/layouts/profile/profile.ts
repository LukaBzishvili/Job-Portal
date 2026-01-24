// import { Component, OnInit, signal } from '@angular/core';
// import { User } from '../../models/firestore';
// import { Firestore } from '../../services/firestore';
// import { LoadingService } from '../../services/loading-service';
// import { CommonModule } from '@angular/common';
// import { FormControl, ReactiveFormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-profile',
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './profile.html',
//   styleUrl: './profile.scss',
// })
// export class Profile implements OnInit {
//   user: User | null = null;
//   addingSkill = signal(false);
//   newSkill = new FormControl('');
//   isSaveDIsabled = true;
//   constructor(
//     private fs: Firestore,
//     public loading: LoadingService,
//   ) {}

//   async ngOnInit(): Promise<void> {
//     this.user = await this.loading.track(this.fs.getCurrentUserProfile());
//     console.log('Current user profile: ', this.user);

//     // for (const key in this.user) {
//     //   console.log(`${key}: ${this.user[key as keyof User]}`);
//     // }
//   }

//   uploadProgress: number | null = null;
//   imagePreview: string | null = null;

//   onFileSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       const file = input.files[0];
//       console.log(input.files[0]);
//       this.imagePreview = URL.createObjectURL(file);
//     }
//   }

//   addMoreSkill() {
//     if (!this.user) return;
//     if (!this.user.skills) {
//       this.user.skills = [];
//     }
//     this.addingSkill.set(true);
//   }

//   saveSkill() {
//     if (!this.user) return;
//     const skill = this.newSkill.value?.trim();
//     if (skill && skill.length > 0) {
//       this.user.skills!.push(skill);
//       this.newSkill.reset();
//     }
//   }
// }

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { User } from '../../models/firestore';
import { Firestore } from '../../services/firestore';
import { LoadingService } from '../../services/loading-service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  user: User | null = null;
  isSaving = false;
  private oldUserSnapshot = '';
  addingSkill = signal(false);
  newSkill = new FormControl('');
  isSaveDisabled = true;
  uploadProgress: number | null = null;
  // imagePreview: string | null = null;

  constructor(
    private fs: Firestore,
    public loading: LoadingService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.user = await this.loading.track(this.fs.getCurrentUserProfile());

    this.oldUserSnapshot = this.serializeUser(this.user);
    this.updateSaveDisabled();

    // console.log('Current user profile: ', this.user);
  }

  // onFileSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     const file = input.files[0];
  //     this.imagePreview = URL.createObjectURL(file);
  //     console.log(URL.createObjectURL(file));

  //     this.isSaveDisabled = false;
  //   }
  // }

  private serializeUser(user: User | null): string {
    if (!user) return '';

    const editable = {
      fullName: (user as any).fullName ?? '',
      phoneNumber: (user as any).phoneNumber ?? null,
      email: (user as any).email ?? '',
      jobTitle: (user as any).jobTitle ?? '',
      yearsOfExperience: (user as any).yearsOfExperience ?? null,
      skills: Array.isArray((user as any).skills) ? [...((user as any).skills as string[])] : [],
      githubURL: (user as any).githubURL ?? '',
      linkedinURL: (user as any).linkedinURL ?? '',
      location: {
        city: (user as any).location?.city ?? '',
        country: (user as any).location?.country ?? '',
      },
      // photoURL: (user as any).photoURL ?? '',
    };

    return JSON.stringify(editable);
  }

  submitChanges(): void {
    if (!this.user || !this.user.id) return;

    const payload: Partial<User> = {
      fullName: this.user.fullName,
      phoneNumber: this.user.phoneNumber,
      email: this.user.email,
      jobTitle: this.user.jobTitle,
      yearsOfExperience: this.user.yearsOfExperience,
      skills: this.user.skills ?? [],
      githubURL: this.user.githubURL,
      linkedinURL: this.user.linkedinURL,
      location: this.user.location ?? { city: '', country: '' },
      // photoURL: this.user.photoURL,
    };

    console.log('Submitting user profile changes:', payload);

    this.isSaving = true;

    this.fs
      .updateUser(this.user.id, payload)
      .then(() => this.markSaved())
      .catch((err) => console.error('Update failed:', err))
      .finally(() => (this.isSaving = false));
  }

  private updateSaveDisabled(): void {
    this.isSaveDisabled = this.serializeUser(this.user) === this.oldUserSnapshot;
  }

  markChanged(): void {
    this.updateSaveDisabled();
  }

  markSaved(): void {
    this.oldUserSnapshot = this.serializeUser(this.user);
    this.updateSaveDisabled();
  }

  private getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  onFullNameInput(event: Event): void {
    if (!this.user) return;
    (this.user as any).fullName = this.getInputValue(event);
    this.markChanged();
  }

  onPhoneInput(event: Event): void {
    if (!this.user) return;
    const raw = this.getInputValue(event).trim();
    const num = raw === '' ? null : Number(raw);

    (this.user as any).phoneNumber = Number.isFinite(num as number) ? num : null;

    this.markChanged();
  }

  onEmailInput(event: Event): void {
    if (!this.user) return;
    (this.user as any).email = this.getInputValue(event);
    this.markChanged();
  }

  onJobTitleInput(event: Event): void {
    if (!this.user) return;
    (this.user as any).jobTitle = this.getInputValue(event);
    this.markChanged();
  }

  onExperienceInput(event: Event): void {
    if (!this.user) return;
    const raw = this.getInputValue(event).trim();
    const num = raw === '' ? null : Number(raw);

    (this.user as any).yearsOfExperience = Number.isFinite(num as number) ? num : null;

    this.markChanged();
  }

  onSkillInput(index: number, event: Event): void {
    if (!this.user) return;

    const u: any = this.user as any;
    u.skills ??= [];
    u.skills[index] = this.getInputValue(event);

    this.markChanged();
  }

  onGithubInput(event: Event): void {
    if (!this.user) return;
    (this.user as any).githubURL = this.getInputValue(event);
    this.markChanged();
  }

  onLinkedinInput(event: Event): void {
    if (!this.user) return;
    (this.user as any).linkedinURL = this.getInputValue(event);
    this.markChanged();
  }

  onCityInput(event: Event): void {
    if (!this.user) return;

    const u: any = this.user as any;
    u.location ??= { city: '', country: '' };
    u.location.city = this.getInputValue(event);

    this.markChanged();
  }

  onCountryInput(event: Event): void {
    if (!this.user) return;

    const u: any = this.user as any;
    u.location ??= { city: '', country: '' };
    u.location.country = this.getInputValue(event);

    this.markChanged();
  }

  addMoreSkill(): void {
    if (!this.user) return;

    const u: any = this.user as any;
    u.skills ??= [];

    this.addingSkill.set(true);
  }

  saveSkill(): void {
    if (!this.user) return;

    const skill = this.newSkill.value?.trim();
    if (skill && skill.length > 0) {
      const u: any = this.user as any;
      u.skills ??= [];
      u.skills.push(skill);

      this.newSkill.reset();
      this.markChanged();
    }
  }
}
