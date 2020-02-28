'use strict';

function SPDateController($scope) {
    'ngInject';
    this.minDate = new Date();
    this.isOpen = false;
    this.getDateStyle = function(checkedValue){
        if (checkedValue === undefined || checkedValue === null) return;
        if (checkedValue.dueDate === undefined || checkedValue.dueDate === null) return;
        let currentDate = new Date();
        let currDay = currentDate.getDate();
        let currentDataPlusDay = currDay + 1; //day
        let curr_month = currentDate.getMonth();
        let curr_year = currentDate.getFullYear();

        let selectedNodeDate = checkedValue.dueDate;
        let selDay = selectedNodeDate.getDate();
        let sel_month = selectedNodeDate.getMonth();
        let sel_year = selectedNodeDate.getFullYear();
        let selectedDatePlusDay = new Date(sel_year,sel_month,(selDay + 1));

        let dataClass = "data_red";
        if(currDay === selDay && curr_month === sel_month && curr_year === sel_year){
            dataClass = "data_red";
        }else if(curr_month === sel_month && curr_year === sel_year && currentDataPlusDay === selDay){
            dataClass = "data_yellow";
        }else if(selectedDatePlusDay > currentDate){
            dataClass = "data_green";
        }

        return dataClass;
    }
}

export default SPDateController;
