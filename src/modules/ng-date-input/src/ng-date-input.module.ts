import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CalendarComponent } from './components/calendar/calendar.component';
import { DateInputComponent } from './components/datepicker/date-input.component';
import { FormatMomentDatePipe } from './pipes/format-moment-date.pipe';

const declarations = [
  CalendarComponent,
  DateInputComponent,
  FormatMomentDatePipe,
];

@NgModule({
  declarations: [ ...declarations ],
  exports: [ ...declarations ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class NgDateInputModule {}
