import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-screen',
  imports: [],
  templateUrl: './loading-screen.html',
  styleUrl: './loading-screen.scss',
})
export class LoadingScreen {
  @Input() fullscreen = true;
  @Input() text = 'Loading...';
  @Input() dimBackground = true;
}
