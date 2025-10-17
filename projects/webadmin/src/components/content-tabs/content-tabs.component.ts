import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { DftNavTabItem, DftNavTabsComponent } from '@drafto/material/navtabs';
import { MatTabNavPanel } from '@angular/material/tabs';
import { RouterOutlet } from '@angular/router';
import { ContentTabsSotre } from '../../store/content-tabs.store';
import { MatExpansionModule } from "@angular/material/expansion";
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: "dftwa-content-tabs",
  imports: [DftNavTabsComponent, MatTabNavPanel, RouterOutlet, MatExpansionModule, NgTemplateOutlet],
  templateUrl: "./content-tabs.component.html",
  styleUrl: "./content-tabs.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContentTabsComponent implements AfterViewInit {
  protected readonly _store = inject(ContentTabsSotre);

  ngAfterViewInit(): void {
    this.initialized.set(true);
  }

  protected readonly initialized = signal(false);
  protected readonly navTabs = this._store.filteredTabs;
  protected readonly navTabHeaderTemplateRef = this._store.navTabHeaderTemplateRef;
  protected readonly headerTemplateRef = this._store.headerTemplateRef;

  protected onNavTabChanged(tab: DftNavTabItem): void {
    this._store.setActiveTab(tab);
  }
}
