import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
} from '@angular/core';
import { AuthStore } from '../store/auth.store';

export declare type PermissionMode = 'AND' | 'OR';

@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private _authStore = inject(AuthStore);
  private _templateRef = inject(TemplateRef<unknown>);
  private _viewContainer = inject(ViewContainerRef);

  hasPermission = input.required<string | string[]>();
  permissionMode = input<PermissionMode>('AND');

  private _viewCreated = false;

  constructor() {
    effect(() => {
      let required = this.hasPermission();
      if (!required?.length) return;

      const mode = this.permissionMode();
      const permissions = this._authStore.permissions();

      required = Array.isArray(required) ? required : [required];

      const allowed =
        mode === 'AND'
          ? required.every((p) => permissions.includes(p))
          : required.some((p) => permissions.includes(p));

      if (allowed && !this._viewCreated) {
        this._viewContainer.createEmbeddedView(this._templateRef);
        this._viewCreated = true;
      } else if (!allowed && this._viewCreated) {
        this._viewContainer.clear();
        this._viewCreated = false;
      }
    });
  }
}
