(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["containers-image-view-container-image-container-module"],{

/***/ "./src/app/containers/image-view-container/image-container.module.ts":
/*!***************************************************************************!*\
  !*** ./src/app/containers/image-view-container/image-container.module.ts ***!
  \***************************************************************************/
/*! exports provided: ImageContainerModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ImageContainerModule", function() { return ImageContainerModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "../../node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "../../node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _views_images_list_view_images_list_view_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../views/images-list-view/images-list-view.component */ "./src/app/views/images-list-view/images-list-view.component.ts");





var routes = [
    { path: '', component: _views_images_list_view_images_list_view_component__WEBPACK_IMPORTED_MODULE_4__["ImagesListViewComponent"] },
];
var ImageContainerModule = /** @class */ (function () {
    function ImageContainerModule() {
    }
    ImageContainerModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [
                _angular_common__WEBPACK_IMPORTED_MODULE_2__["CommonModule"],
                _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterModule"].forChild(routes),
            ],
            declarations: [
                _views_images_list_view_images_list_view_component__WEBPACK_IMPORTED_MODULE_4__["ImagesListViewComponent"],
            ],
        })
    ], ImageContainerModule);
    return ImageContainerModule;
}());



/***/ }),

/***/ "./src/app/views/images-list-view/images-list-view.component.html":
/*!************************************************************************!*\
  !*** ./src/app/views/images-list-view/images-list-view.component.html ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<p>\n  images-list-view works!\n</p>\n"

/***/ }),

/***/ "./src/app/views/images-list-view/images-list-view.component.ts":
/*!**********************************************************************!*\
  !*** ./src/app/views/images-list-view/images-list-view.component.ts ***!
  \**********************************************************************/
/*! exports provided: ImagesListViewComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ImagesListViewComponent", function() { return ImagesListViewComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../../node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "../../node_modules/@angular/core/fesm5/core.js");


var ImagesListViewComponent = /** @class */ (function () {
    function ImagesListViewComponent() {
    }
    ImagesListViewComponent.prototype.ngOnInit = function () {
    };
    ImagesListViewComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-images-list-view',
            template: __webpack_require__(/*! ./images-list-view.component.html */ "./src/app/views/images-list-view/images-list-view.component.html"),
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], ImagesListViewComponent);
    return ImagesListViewComponent;
}());



/***/ })

}]);
//# sourceMappingURL=containers-image-view-container-image-container-module.js.map