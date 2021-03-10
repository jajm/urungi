(function () {
    'use strict';

    angular.module('app.reports').component('appReportSettingsModal', {
        templateUrl: 'partials/reports/report-settings-modal.component.html',
        controller: ReportSettingsModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    ReportSettingsModalController.$inject = [];

    function ReportSettingsModalController () {
        const vm = this;

        vm.$onInit = $onInit;
        vm.aggregationsOptions = [];
        vm.isForDash = false;
        vm.report = {};
        vm.settings = {};

        function $onInit () {
            const report = vm.resolve.report;
            const isForDash = vm.resolve.isForDash;

            vm.report = report;
            vm.isForDash = isForDash;

            vm.settings.reportType = report.reportType;
            vm.settings.legendPosition = report.properties.legendPosition;
            vm.settings.height = report.properties.height;
            vm.settings.theme = report.theme;
        }
    }
})();
