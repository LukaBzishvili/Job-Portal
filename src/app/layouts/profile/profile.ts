import { Component, OnInit, signal } from '@angular/core';
import { User } from '../../models/firestore';
import { Firestore } from '../../services/firestore';
import { LoadingService } from '../../services/loading-service';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  user: User | null = null;
  addingSkill = signal(false);
  newSkill = new FormControl('');
  constructor(
    private fs: Firestore,
    public loading: LoadingService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.user = await this.loading.track(this.fs.getCurrentUserProfile());
    console.log('Current user profile: ', this.user);

    // for (const key in this.user) {
    //   console.log(`${key}: ${this.user[key as keyof User]}`);
    // }
  }

  addMoreSkill() {
    if (!this.user) return;
    if (!this.user.skills) {
      this.user.skills = [];
    }
    this.addingSkill.set(true);
  }

  saveSkill() {
    if (!this.user) return;
    const skill = this.newSkill.value?.trim();
    if (skill && skill.length > 0) {
      this.user.skills!.push(skill);
      this.newSkill.reset();
    }
  }
}
