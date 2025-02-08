import { Component, OnInit } from '@angular/core';
import { TokenInterceptor } from './token.interceptor';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-token-progress',
  template: `
    <div *ngIf="progress$ | async as progress">
      <p>Progress: {{ progress }}%</p>
      <div *ngIf="progress < 100" class="progress-bar">
        <div [style.width.%]="progress"></div>
      </div>
    </div>
  `,
  styles: [`
    .progress-bar {
      width: 100%;
      height: 20px;
      background-color: lightgray;
    }
    .progress-bar div {
      height: 100%;
      background-color: green;
    }
  `]
})
export class TokenProgressComponent implements OnInit {
  progress$: BehaviorSubject<number>;

  constructor(private tokenInterceptor: TokenInterceptor) {
    this.progress$ = tokenInterceptor['progressSubject'];
  }

  ngOnInit() {}
}
