import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import * as moment from 'moment';
import {defaultDateRangePickerOptions} from '../../constants';
import {IChangedData, IDateRangePickerOptions, IDefinedDateRange} from '../../interfaces';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'date-range-picker',
  styleUrls: ['./date-range-picker.component.scss'],
  templateUrl: './date-range-picker.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerComponent),
      multi: true,
    },
  ]
})
export class DateRangePickerComponent implements OnInit, ControlValueAccessor {

  @Input() options: IDateRangePickerOptions = defaultDateRangePickerOptions;

  @Input() displayValue: string = null;

  @Input() fromDate: moment.Moment = null;

  @Input() toDate: moment.Moment = null;

  @Output() datepickerReset = new EventEmitter<any>();

  defaultRanges: IDefinedDateRange[];
  isMobile = false;
  fromMonth: number;
  fromYear: number;
  toMonth: number;
  toYear: number;
  range = '';
  isOpen = false;

  get enableApplyButton(): boolean {
    let enabled = !this.options.autoApply && this.fromDate !== null;

    if (this.options.singleCalendar) {
      return enabled;
    }

    return enabled && this.toDate !== null;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (this.isOpen && !this._elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    } else if (!this.isOpen && this._elementRef.nativeElement.contains(event.target) && !this.disabled) {
      this.isOpen = true;
    }
  }

  value: [string, string] = [null, null];

  disabled: boolean = false;

  constructor(
    private _elementRef: ElementRef
  ) {
  }

  private onChange = (v: any) => {
  };
  private onTouched = () => {
  };

  writeValue(value: [any, any]): void {
    if (Array.isArray(value) && value.length == 2) {
      if (value.every(d => d instanceof Date && !isNaN(d as unknown as number))) {
        this.value = value.map(d => d.toISOString().split('T')[0]) as [string, string];
      }

      if (value.every(d => d instanceof String)) {
        this.value = value;
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnInit(): void {
    if (navigator) {
      if (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)) {
        this.isMobile = true;
      }
    }

    // ensure dates in options are valid
    this.validateOptionDates();

    // ensure input dates are within the min/max dates in options
    this.validateInputDates();

    if (this.options.preDefinedRanges && this.options.preDefinedRanges.length > 0) {
      this.defaultRanges = this.validateAndAssignPredefinedRanges(this.options.preDefinedRanges);
    }

    // assign values not present in options with default values
    const optionsKeys = Object.keys(this.options);
    const defaultValuesKeys = Object.keys(defaultDateRangePickerOptions);

    defaultValuesKeys.forEach((key: string) => {
      if (!optionsKeys.includes(key)) {
        this.options[key] = defaultDateRangePickerOptions[key];
      }
    });

    // update calendar grid
    this.updateCalendar();
  }

  validateInputDates(): void {
    if (typeof this.fromDate === 'string') {
      this.fromDate = moment(this.fromDate);
    }

    if (typeof this.toDate === 'string') {
      this.toDate = moment(this.toDate);
    }

    if (this.fromDate && this.options.minDate && this.fromDate.isBefore(this.options.minDate, 'date')) {
      throw new RangeError('@Input fromDate is before the specified minDate in options');
    }

    if (this.toDate && this.options.maxDate && this.toDate.isAfter(this.options.maxDate, 'date')) {
      throw new RangeError('@Input toDate is after the specified maxDate in options');
    }
  }

  validateOptionDates(): void {
    // validate maxDate isn't before minDate or vice versa
    if (this.options) {
      if (this.options.minDate && this.options.maxDate) {
        if (this.options.minDate.isAfter(this.options.maxDate, 'date')) {
          throw new RangeError('minDate specified in options is after the maxDate');
        } else if (this.options.maxDate.isBefore(this.options.minDate, 'date')) {
          throw new RangeError('maxDate specified in options is before the minDate');
        }
      }
    }
  }

  // assists CSS to fix small positioning bug with From:/To: date text
  checkChrome(): string {
    return window['chrome'] ? 'is-chrome' : '';
  }

  toggleCalendarVisibility(value?: boolean): void {
    this.isOpen = value !== null ? value : !this.isOpen;
  }

  setFromToMonthYear(fromDate?: moment.Moment, toDate?: moment.Moment): void {
    const tempFromDate = fromDate || this.fromDate || moment();
    const tempToDate = toDate || this.toDate || moment();

    this.fromMonth = tempFromDate.get('month');
    this.fromYear = tempFromDate.get('year');

    this.toMonth = tempToDate.get('month');
    this.toYear = tempToDate.get('year');
  }

  updateCalendar(): void {
    // get month and year to show calendar
    this.setFromToMonthYear();
    this.emitValue();
  }

  // update from/to based on selection
  dateChanged(changedData: IChangedData): void {
    const value = changedData.day;
    const isLeft = changedData.isLeft;

    if (isLeft) {
      this.fromDate = value;

      if (this.fromDate.isAfter(this.toDate, 'date')) {
        this.toDate = this.fromDate.clone();
      }
    } else {
      this.toDate = value;

      if (this.toDate.isBefore(this.fromDate, 'date')) {
        this.fromDate = this.toDate.clone();
      }
    }

    this.setFromToMonthYear(this.fromDate, this.toDate);

    if (this.options.autoApply && (this.toDate || this.options.singleCalendar)) {
      this.toggleCalendarVisibility(false);
      this.emitValue();
    }
  }

  getMoment(value): moment.Moment {
    return moment(value, this.options.format);
  }

  formatRangeAsString(): string {
    let range = '';

    if (this.options.singleCalendar && this.fromDate) {
      if (typeof this.fromDate === 'string') {
        this.fromDate = moment(this.fromDate);
      }

      range = this.fromDate.format(this.options.format);
    } else if (!this.options.singleCalendar && this.fromDate && this.toDate) {
      if (typeof this.fromDate === 'string') {
        this.fromDate = moment(this.fromDate);
      }

      if (typeof this.toDate === 'string') {
        this.toDate = moment(this.toDate);
      }

      range = `${this.fromDate.format(this.options.format)} - ${this.toDate.format(this.options.format)}`;
    }

    return range;
  }

  emitValue(): void {
    this.range = this.formatRangeAsString();
    this.displayValue = this.formatRangeAsString();

    this.onChange([moment(this.fromDate).format('YYYY-MM-DD'), moment(this.toDate).format('YYYY-MM-DD')]);
  }

  setDateFromInput(event: Event, isLeft: boolean = false): void {
    const target = event.target as HTMLInputElement;

    try {
      if (target.value) {
        const day = this.getMoment(target.value);

        if (!day.isBefore(this.options.minDate) && !day.isAfter(this.options.maxDate)) {
          if (isLeft && !this.fromDate) {
            this.fromDate = day;
          }

          if (!isLeft && !this.toDate) {
            this.toDate = day;
          }

          this.dateChanged({
            day,
            isLeft,
          });

          if (this.fromDate && this.toDate) {
            this.setFromToMonthYear(this.fromDate, this.toDate);

            if (!this.options.autoApply) {
              // this.emitRangeSelected();
            }
          }
        } else {
          // assume nothing - reset values
          this.fromDate = null;
          this.toDate = null;
          target.value = '';
          target.focus();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  monthChanged(data: IChangedData): void {
    let temp;

    if (data.isLeft) {
      temp = moment([this.fromYear, this.fromMonth]).add(data.value, 'month');
      this.fromMonth = temp.get('month');
      this.fromYear = temp.get('year');
    } else {
      temp = moment([this.toYear, this.toMonth]).add(data.value, 'month');
      this.toMonth = temp.get('month');
      this.toYear = temp.get('year');
    }
  }

  yearChanged(data: IChangedData): void {
    let temp;

    if (data.isLeft) {
      temp = moment([this.fromYear, this.fromMonth]).add(data.value, 'year');
      this.fromMonth = temp.get('month');
      this.fromYear = temp.get('year');
    } else {
      temp = moment([this.toYear, this.toMonth]).add(data.value, 'year');
      this.toMonth = temp.get('month');
      this.toYear = temp.get('year');
    }
  }

  close(event: Event): void {
    this.toggleCalendarVisibility(false);

    event.stopPropagation();
  }

  reset(event: Event): void {
    this.fromDate = null;
    this.toDate = null;
    this.emitValue();
    this.datepickerReset.emit();

    event.stopPropagation();
  }

  apply(event: Event): void {
    this.toggleCalendarVisibility(false);
    this.emitValue();
    // this.emitRangeSelected();
    event.stopPropagation();
  }

  applyPredefinedRange(event: Event, definedDateRange: IDefinedDateRange): void {
    // adjust to/from month/year so calendar months and years match range
    this.setFromToMonthYear(definedDateRange.value.start, definedDateRange.value.end);

    this.fromDate = definedDateRange.value.start;
    this.toDate = definedDateRange.value.end;

    if (this.options.autoApply) {
      this.apply(event);
    }
  }

  validateAndAssignPredefinedRanges(ranges: IDefinedDateRange[]): IDefinedDateRange[] {
    return ranges.filter(range => {
      if (range.value.start.isAfter(range.value.end, 'date')) {
        throw new RangeError(`Pre-defined range "${range.name}" start date cannot be after the end date for the range.`);
      }

      if (this.options.minDate && range.value.start.isBefore(this.options.minDate)) {
        throw new RangeError(`Pre-defined range "${range.name}" start date is before the specified minDate in your options.`);
      }

      if (this.options.maxDate && range.value.end.isAfter(this.options.maxDate)) {
        throw new RangeError(`Pre-defined range "${range.name}" end date is after the specified maxDate in your options.`);
      }

      // add range to ranges
      return true;
    });
  }
}
