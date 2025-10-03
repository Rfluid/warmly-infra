import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full">
      <label *ngIf="label" [for]="id" class="block text-sm font-medium text-warmly-text-primary mb-1.5">
        {{ label }}
        <span *ngIf="required" class="text-warmly-danger">*</span>
      </label>
      <div class="relative">
        <ng-content select="[prefix]"></ng-content>
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [class]="inputClasses"
          [(ngModel)]="value"
          (blur)="onTouched()"
          (input)="onInputChange($event)"
        />
        <ng-content select="[suffix]"></ng-content>
      </div>
      <p *ngIf="error" class="mt-1 text-sm text-warmly-danger">{{ error }}</p>
      <p *ngIf="hint && !error" class="mt-1 text-sm text-warmly-text-muted">{{ hint }}</p>
    </div>
  `,
  styles: []
})
export class InputComponent implements ControlValueAccessor {
  @Input() id: string = `input-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label?: string;
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() error?: string;
  @Input() hint?: string;
  @Output() valueChange = new EventEmitter<string>();

  value: string = '';
  onChange: any = () => {};
  onTouched: any = () => {};

  get inputClasses(): string {
    const baseClasses = 'w-full px-4 py-2 bg-white/50 border rounded-warmly-md transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent';
    const errorClasses = this.error 
      ? 'border-warmly-danger focus:ring-warmly-danger/50' 
      : 'border-warmly-border focus:ring-warmly-primary/50';
    const disabledClasses = this.disabled ? 'opacity-50 cursor-not-allowed' : '';
    
    return `${baseClasses} ${errorClasses} ${disabledClasses}`;
  }

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: any): void {
    this.value = event.target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }
}

