import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';

import { DateInputComponent } from '../modules/ng-date-input/src/components/datepicker/date-input.component';
import { IDateRange, IDateRangePickerOptions } from '../modules/ng-date-input/src/interfaces';
@Component({
	encapsulation: ViewEncapsulation.None,
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

	@ViewChild('dateRangePicker', { static: true })
	dateRangePicker: DateInputComponent;

	firstFieldEmittedValue: IDateRange;
	firstFieldOptions: IDateRangePickerOptions = {
		format: 'DD/MM/YYYY',
		icons: 'font-awesome',
		minDate: moment().subtract(10, 'years'),
		maxDate: moment().add(3, 'years'),
		preDefinedRanges: [
			{
				name: 'Last Week',
				value: {
					start: moment().subtract(1, 'week').startOf('week'),
					end: moment().subtract(1, 'week').endOf('week')
				}
			},
			{
				name: 'Two Weeks Ago',
				value: {
					start: moment().subtract(2, 'week').startOf('week'),
					end: moment().subtract(2, 'week').endOf('week')
				}
			}
		]
	}

	secondFieldOptions: IDateRangePickerOptions = {
		format: 'DD/MM/YYYY',
		minDate: moment().subtract(10, 'years'),
		maxDate: moment().add(1, 'year'),
	}

	rightFieldOptions: IDateRangePickerOptions = {
		format: 'DD/MM/YYYY',
		icons: 'material',
		minDate: moment().subtract(2, 'years'),
		maxDate: moment().add(1, 'year'),
		position: 'right',
	}

	singleFieldOptions: IDateRangePickerOptions = {
		autoApply: true,
		clickOutsideAllowed: false,
		format: 'DD/MM/YYYY',
		icons: 'material',
		minDate: moment().subtract(2, 'years'),
		maxDate: moment().add(1, 'year'),
	}

	disableInputDisplayOptions: IDateRangePickerOptions = {
		disableInputDisplay: true,
		format: 'DD/MM/YYYY',
		icons: 'material',
		minDate: moment().subtract(2, 'years'),
		maxDate: moment().add(1, 'year')
	};

	form: FormGroup = this.formBuilder.group({
		firstDateRange: []
	});

	dateRange2: [string, string] = ["2021-09-02", "2021-09-24"];
	dateRange3: string = "2003-06-01";
	dateRange4: string = "2003-06-01";

	constructor(
		private formBuilder: FormBuilder,
	) { }

	ngOnInit(): void { }

	onRangeSelected(value: IDateRange): void {
		this.firstFieldEmittedValue = value;
	}

	onReset(event: Event): void {
		this.dateRangePicker.reset(event);
	}
}
