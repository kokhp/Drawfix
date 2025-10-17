import { Component } from '@angular/core';
import { UploadPostersComponent } from '../../../poster/components/upload-posters/upload-posters.component';

export function generateTimesWith5MinInterval(): string[] {
  const times: string[] = [];
  const period = ['AM', 'PM'];

  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 5) {
      const hour = i % 12 === 0 ? 12 : i % 12; // Convert 24-hour format to 12-hour format
      const minute = j < 10 ? `0${j}` : j; // Add leading zero to minutes if needed
      const suffix = period[Math.floor(i / 12)];
      times.push(`${hour}:${minute} ${suffix}`);
    }
  }

  return times;
}

@Component({
  selector: 'dftwa-layout',
  imports: [UploadPostersComponent],
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export default class DashboardLayoutComponent {
  protected readonly timeOptions = generateTimesWith5MinInterval();
}
