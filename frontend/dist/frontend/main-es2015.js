(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "+7u6":
/*!***********************************************************!*\
  !*** ./src/app/services/chatsystem/friendlist.service.ts ***!
  \***********************************************************/
/*! exports provided: FriendlistService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FriendlistService", function() { return FriendlistService; });
/* harmony import */ var _models_Room_Widget_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../models/Room_Widget.model */ "b74p");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _socket_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./socket.service */ "QeH8");





class FriendlistService {
    constructor(SocketService) {
        this.SocketService = SocketService;
        // lists of variables (eg: chatrooms, open chatWidgets)
        this.roomarr = []; // all chatrooms of user
        this.widgetarr = []; // open chatWidgets roomName(s)
        this.idarr = []; // open chatWidget roomId(s)
        // creating observable
        this._chatroomList = new rxjs__WEBPACK_IMPORTED_MODULE_2__["BehaviorSubject"](this.roomarr);
        this.chatroomList = this._chatroomList.asObservable();
        this._openWidgets = new rxjs__WEBPACK_IMPORTED_MODULE_2__["BehaviorSubject"]([]);
        this.openWidgets = this._openWidgets.asObservable();
        this._windowSize = new rxjs__WEBPACK_IMPORTED_MODULE_2__["BehaviorSubject"](window.innerWidth);
        this.windowSize = this._windowSize.asObservable();
        this._roomModel = new rxjs__WEBPACK_IMPORTED_MODULE_2__["BehaviorSubject"](new _models_Room_Widget_model__WEBPACK_IMPORTED_MODULE_0__["RoomWidget"]('asd', 'asd', false));
        this.roomModel = this._roomModel.asObservable();
    }
    // gets list of chatrooms with corresponding properties than user's query
    getList(array) {
        array.push(sessionStorage.getItem('username'));
        const polishedarr = (array.filter((a, b) => array.indexOf(a) === (b))).sort();
        // sends array of users in alphabeltical order
        this.SocketService.emit('searchChatroom', { sender: sessionStorage.getItem('username'), req: polishedarr }, (data) => {
            this.roomarr = [];
            this._chatroomList.next(this.roomarr);
            if (data.err) {
                console.log(data.err);
            }
            else if (data.res) {
                (data.res).forEach(element => {
                    let unread;
                    if (element.messages.length) { // check if chat is empty and if last message is unread
                        const lastIndex = element.messages.length - 1;
                        if (element.messages[lastIndex].seen.includes(sessionStorage.getItem('username'))) {
                            unread = false;
                        }
                        else {
                            unread = true;
                        }
                    }
                    else {
                        unread = false;
                    }
                    this.roomarr.push({
                        roomName: element.roomName,
                        roomId: element._id,
                        unread
                    });
                });
                this._chatroomList.next(this.roomarr);
            }
        });
    }
    // looks for room model given a roomid
    getRoomWidget(roomId) {
        this.roomarr.forEach((room) => {
            if (room.roomId == roomId) {
                this._roomModel.next(room);
            }
        });
    }
    // looks for users existence and creates chatroom
    CreateChatroom(users) {
        const array = users.split(' ');
        let polishedarr = (array.filter((a, b) => array.indexOf(a) === (b))).sort();
        this.SocketService.emit('searchUser', polishedarr, (data) => {
            if (data.err) {
                console.log(data.err);
            }
            else if (data.res) {
                polishedarr.push(sessionStorage.getItem('username'));
                this.SocketService.emit('createChatroom', polishedarr.sort());
            }
            polishedarr = [];
        });
    }
    // selecting a Chatroom from Friendlist component
    toggleChatWidget(friend) {
        if (this.idarr.includes(friend.roomId)) {
            const i = this.idarr.indexOf(friend.roomId);
            this.widgetarr.splice(i, 1);
            this.idarr.splice(i, 1);
            friend.open = false;
        }
        else {
            this.widgetarr.push(friend.roomName);
            this.idarr.push(friend.roomId);
            friend.open = true;
        }
        this._openWidgets.next({
            roomNames: this.widgetarr,
            roomIds: this.idarr
        });
    }
    // listen for unread messages from backend
    getNotifications() {
        this.SocketService.listen('notification').subscribe((data) => {
            if (data.res) {
                const i = this.roomarr.findIndex((e) => e.roomId === data.res.roomId);
                if (data.res.action == 'message') {
                    if (i != -1) {
                        console.log('i defined ' + i);
                        if (data.res.sender == sessionStorage.getItem('username')) {
                            this.roomarr[i].unread = false;
                        }
                        else {
                            this.roomarr[i].unread = true;
                        }
                        this._chatroomList.next(this.roomarr);
                    }
                    else {
                        console.log('i undefined');
                    }
                }
                else if (data.res.action == 'seen') {
                    data.res.seen.forEach(element => {
                        if (element.includes(sessionStorage.getItem('username'))) {
                            this.roomarr[i].unread = false;
                            this._chatroomList.next(this.roomarr);
                        }
                    });
                }
            }
        });
    }
    // user interacted with chatwidget
    // mark as read in angular
    selectChatwidget(roomId) {
        this.SocketService.emit('initChatroom', { id: roomId, username: sessionStorage.getItem('username') }, (data) => {
            if (data) {
                const i = this.roomarr.findIndex((e) => e.roomId === roomId);
                this.roomarr[i].unread = false;
                this._chatroomList.next(this.roomarr);
            }
        });
    }
    resizeWindow(width) {
        const CHATWIDGETWIDTH = 220;
        const FRIENDLISTWIDTH = 220 + (width * .2); // take in account sidebar of 20%
        const MAXNUM = Math.floor((width - FRIENDLISTWIDTH) / CHATWIDGETWIDTH); // take into account friendlist component
        if (this.widgetarr.length > MAXNUM) {
            for (let x = this.widgetarr.length; x > MAXNUM; x--) {
                const removedRoomId = this.idarr[0];
                this.roomarr.forEach((room) => {
                    if (room.roomId == removedRoomId) {
                        room.open = false;
                    }
                });
                this.widgetarr.shift();
                this.idarr.shift();
            }
        }
        this._windowSize.next(width);
    }
    ngOnDestroy() {
        this.SocketService.remove('notification');
    }
}
FriendlistService.ɵfac = function FriendlistService_Factory(t) { return new (t || FriendlistService)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_socket_service__WEBPACK_IMPORTED_MODULE_3__["SocketService"])); };
FriendlistService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: FriendlistService, factory: FriendlistService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](FriendlistService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _socket_service__WEBPACK_IMPORTED_MODULE_3__["SocketService"] }]; }, null); })();


/***/ }),

/***/ "/J2p":
/*!*******************************************************!*\
  !*** ./src/app/components/filter/filter.component.ts ***!
  \*******************************************************/
/*! exports provided: FilterComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FilterComponent", function() { return FilterComponent; });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_cdk_tree__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/cdk/tree */ "y7ui");
/* harmony import */ var src_app_services_search_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/services/search.service */ "l3hs");
/* harmony import */ var _services_trip_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./../../services/trip.service */ "W524");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var _angular_material_tree__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/tree */ "OLiY");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/checkbox */ "pMoy");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");











function FilterComponent_mat_tree_node_1_Template(rf, ctx) { if (rf & 1) {
    const _r4 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "mat-tree-node", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "li", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](2, "button", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "mat-checkbox", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("change", function FilterComponent_mat_tree_node_1_Template_mat_checkbox_change_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r4); const node_r2 = ctx.$implicit; const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r3.clickedActive(node_r2); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const node_r2 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("checked", node_r2.checked);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", node_r2.name, " ");
} }
function FilterComponent_mat_nested_tree_node_2_Template(rf, ctx) { if (rf & 1) {
    const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "mat-nested-tree-node");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "li");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "button", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "mat-icon", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "mat-checkbox", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("change", function FilterComponent_mat_nested_tree_node_2_Template_mat_checkbox_change_6_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r7); const node_r5 = ctx.$implicit; const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r6.setAll(node_r5); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](8, "ul");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainer"](9, 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const node_r5 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵattribute"]("aria-label", "toggle " + node_r5.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", ctx_r1.treeControl.isExpanded(node_r5) ? "expand_more" : "chevron_left", " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("checked", ctx_r1.initiateChildrenChecker(node_r5.categories))("indeterminate", !ctx_r1.initiateChildrenChecker(node_r5.categories) && ctx_r1.initiateAtLeastOneChecked(node_r5.categories));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", node_r5.name, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵclassProp"]("example-tree-invisible", !ctx_r1.treeControl.isExpanded(node_r5));
} }
class FilterComponent {
    constructor(SearchService, TripService, ActivatedRoute) {
        this.SearchService = SearchService;
        this.TripService = TripService;
        this.ActivatedRoute = ActivatedRoute;
        this.panelOpenState = false;
        this.categoriesTree = null;
        this.categoriesSet = null;
        this.allComplete = null;
        this.count = 0;
        this.treeControl = new _angular_cdk_tree__WEBPACK_IMPORTED_MODULE_2__["NestedTreeControl"](node => node.categories);
        this._selectedNodes = new rxjs__WEBPACK_IMPORTED_MODULE_0__["BehaviorSubject"](null);
        this.selectedNodes = this._selectedNodes.asObservable();
        /** Checks if datasource for material tree has any child groups */
        this.hasChild = (_, node) => !!node.categories && node.categories.length > 0;
    }
    ngOnInit() {
        this.categoriesSet_sub = this.SearchService.categorySet.subscribe((set) => this.categoriesSet = set);
        this.categoriesTree_sub = this.SearchService.categoryTree.subscribe((tree) => {
            if (tree) {
                this.categoriesTree = tree;
                // sets category filter from url params
                this.ActivatedRoute.queryParams.subscribe((params) => {
                    if (params.category) {
                        if (params.category === 'All') {
                            null;
                        }
                        else {
                            this.categoriesTree.forEach((child) => {
                                if (child.name != params.category) {
                                    this.uncheckAll(child.categories);
                                }
                                else {
                                    this.checkAll(child.categories);
                                }
                            });
                        }
                    }
                });
            }
        });
    }
    /**toggle checkmark for leafs */
    clickedActive(element) {
        element.checked = !element.checked;
        this.modifyIdSet(element);
        this.SearchService.updateCategoryTree(this.categoriesTree);
    }
    /**toggle checkmark for nodes && node itself */
    setAll(category) {
        const allChecked = this.initiateChildrenChecker(category.categories);
        if (!allChecked) {
            this.SearchService.treeValues.categorySet.has(category.id) ? null : this.SearchService.treeValues.categorySet.add(category.id);
            this.checkAll(category.categories);
        }
        else if (allChecked) {
            this.SearchService.treeValues.categorySet.has(category.id) ? this.SearchService.treeValues.categorySet.delete(category.id) : null;
            this.uncheckAll(category.categories);
        }
        this.SearchService.updateCategoryTree(this.categoriesTree);
    }
    /** checks all children of a node && node itself */
    checkAll(categories) {
        categories.forEach((sub) => {
            sub.checked = true;
            this.SearchService.treeValues.categorySet.has(sub.id) ? null : this.SearchService.treeValues.categorySet.add(sub.id);
            this.SearchService.updateCategorySet(this.categoriesSet);
            // this.modifyIdSet(sub)
            if (sub.categories && sub.categories.length > 0) {
                this.checkAll(sub.categories);
            }
        });
    }
    /** unchecks all children of a node */
    uncheckAll(categories) {
        categories.forEach((sub) => {
            sub.checked = false;
            this.SearchService.treeValues.categorySet.has(sub.id) ? this.SearchService.treeValues.categorySet.delete(sub.id) : null;
            // this.modifyIdSet(sub)
            if (sub.categories && sub.categories.length > 0) {
                this.uncheckAll(sub.categories);
            }
        });
    }
    /**initiates allChildrenChecked() */
    initiateChildrenChecker(categories) {
        let state = true;
        state = this.allChildrenChecked(categories, state);
        return state;
    }
    /** returns false if at least one child is unchecked*/
    allChildrenChecked(categories, state) {
        categories.forEach((child) => {
            if (!state) {
                return state;
            }
            else if (state && child.categories && child.categories.length > 0) {
                state = this.allChildrenChecked(child.categories, state);
            }
            else if (!child.checked) {
                state = false;
                return state;
            }
        });
        return state;
    }
    /**initiates atLeastOneChecked() */
    initiateAtLeastOneChecked(categories) {
        let state = false;
        state = this.atLeastOneChecked(categories, state);
        return state;
    }
    /** returns true if at least one child is checked*/
    atLeastOneChecked(categories, state) {
        categories.forEach((child) => {
            if (state) {
                return state;
            }
            else if (!state && child.categories && child.categories.length > 0) {
                state = this.atLeastOneChecked(child.categories, state);
            }
            else if (child.checked) {
                state = true;
                return state;
            }
        });
        return state;
    }
    /**accepts leaf node, and either removes it or adds it to the array */
    modifyIdSet(node) {
        if (node.checked && !(this.categoriesSet).has(node.id) && node.categories.length === 0) {
            this.categoriesSet.add(node.id);
        }
        else if (!node.checked && this.categoriesSet.has(node.id) && node.categories.length === 0) {
            this.categoriesSet.delete(node.id);
        }
        this.SearchService.updateCategorySet(this.categoriesSet);
    }
    ngOnDestroy() {
        this.categoriesTree_sub.unsubscribe();
        this.categoriesSet_sub.unsubscribe();
    }
}
FilterComponent.ɵfac = function FilterComponent_Factory(t) { return new (t || FilterComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](src_app_services_search_service__WEBPACK_IMPORTED_MODULE_3__["SearchService"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_services_trip_service__WEBPACK_IMPORTED_MODULE_4__["TripService"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["ActivatedRoute"])); };
FilterComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: FilterComponent, selectors: [["app-filter"]], decls: 3, vars: 3, consts: [[1, "example-tree", 2, "padding-left", "1em", 3, "dataSource", "treeControl"], ["matTreeNodeToggle", "", 4, "matTreeNodeDef"], [4, "matTreeNodeDef", "matTreeNodeDefWhen"], ["matTreeNodeToggle", ""], [1, "mat-tree-node"], ["mat-icon-button", "", "disabled", ""], [3, "checked", "change"], ["mat-icon-button", "", "matTreeNodeToggle", ""], [1, "mat-icon-rtl-mirror"], [1, "example-margin", 3, "checked", "indeterminate", "change"], ["matTreeNodeOutlet", ""]], template: function FilterComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "mat-tree", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, FilterComponent_mat_tree_node_1_Template, 5, 2, "mat-tree-node", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](2, FilterComponent_mat_nested_tree_node_2_Template, 10, 7, "mat-nested-tree-node", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("dataSource", ctx.categoriesTree)("treeControl", ctx.treeControl);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("matTreeNodeDefWhen", ctx.hasChild);
    } }, directives: [_angular_material_tree__WEBPACK_IMPORTED_MODULE_6__["MatTree"], _angular_material_tree__WEBPACK_IMPORTED_MODULE_6__["MatTreeNodeDef"], _angular_material_tree__WEBPACK_IMPORTED_MODULE_6__["MatTreeNode"], _angular_material_tree__WEBPACK_IMPORTED_MODULE_6__["MatTreeNodeToggle"], _angular_material_button__WEBPACK_IMPORTED_MODULE_7__["MatButton"], _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_8__["MatCheckbox"], _angular_material_tree__WEBPACK_IMPORTED_MODULE_6__["MatNestedTreeNode"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_9__["MatIcon"], _angular_material_tree__WEBPACK_IMPORTED_MODULE_6__["MatTreeNodeOutlet"]], styles: [".small[_ngcontent-%COMP%] {\n  width: 100%;\n  max-height: 500px;\n  overflow-y: auto;\n  overflow-x: hidden;\n}\n\n.mat-expansion-panel-body[_ngcontent-%COMP%] {\n  padding: 0 8px 4px;\n}\n\n.mat-expansion-panel-header[_ngcontent-%COMP%] {\n  padding: 0 4px;\n}\n\n.checkbox[_ngcontent-%COMP%] {\n  margin: 5px;\n  position: relative;\n  top: 1px;\n}\n\n.example-tree-invisible[_ngcontent-%COMP%] {\n  display: none;\n}\n\n.example-tree[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n  margin-top: 0;\n  margin-bottom: 0;\n  list-style-type: none;\n}\n\nbutton[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 5px;\n}\n\nbutton[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxmaWx0ZXIuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxXQUFBO0VBQ0EsaUJBQUE7RUFDQSxnQkFBQTtFQUNBLGtCQUFBO0FBQ0Y7O0FBRUE7RUFDRSxrQkFBQTtBQUNGOztBQUVBO0VBQ0UsY0FBQTtBQUNGOztBQUVBO0VBQ0UsV0FBQTtFQUNBLGtCQUFBO0VBQ0EsUUFBQTtBQUNGOztBQUVBO0VBQ0UsYUFBQTtBQUNGOztBQUVBO0VBQ0UsYUFBQTtFQUNBLGdCQUFBO0VBQ0EscUJBQUE7QUFDRjs7QUFFQTtFQUNFLGtCQUFBO0VBQ0EsVUFBQTtBQUNGOztBQUVBO0VBQ0UsYUFBQTtBQUNGIiwiZmlsZSI6ImZpbHRlci5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi5zbWFsbHtcclxuICB3aWR0aDogMTAwJTtcclxuICBtYXgtaGVpZ2h0OiA1MDBweDtcclxuICBvdmVyZmxvdy15OiBhdXRvO1xyXG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcclxufVxyXG5cclxuLm1hdC1leHBhbnNpb24tcGFuZWwtYm9keSB7XHJcbiAgcGFkZGluZzogMCA4cHggNHB4O1xyXG59XHJcblxyXG4ubWF0LWV4cGFuc2lvbi1wYW5lbC1oZWFkZXIge1xyXG4gIHBhZGRpbmc6IDAgNHB4O1xyXG59XHJcblxyXG4uY2hlY2tib3h7XHJcbiAgbWFyZ2luOiA1cHg7XHJcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gIHRvcDogMXB4O1xyXG59XHJcblxyXG4uZXhhbXBsZS10cmVlLWludmlzaWJsZSB7XHJcbiAgZGlzcGxheTogbm9uZTtcclxufVxyXG5cclxuLmV4YW1wbGUtdHJlZSBsaSB7XHJcbiAgbWFyZ2luLXRvcDogMDtcclxuICBtYXJnaW4tYm90dG9tOiAwO1xyXG4gIGxpc3Qtc3R5bGUtdHlwZTogbm9uZTtcclxufVxyXG5cclxuYnV0dG9uIHtcclxuICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgcmlnaHQ6IDVweDtcclxufVxyXG5cclxuYnV0dG9uOmZvY3VzIHtcclxuICBvdXRsaW5lOiBub25lO1xyXG59Il19 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](FilterComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"],
        args: [{
                selector: 'app-filter',
                templateUrl: './filter.component.html',
                styleUrls: ['./filter.component.scss']
            }]
    }], function () { return [{ type: src_app_services_search_service__WEBPACK_IMPORTED_MODULE_3__["SearchService"] }, { type: _services_trip_service__WEBPACK_IMPORTED_MODULE_4__["TripService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_5__["ActivatedRoute"] }]; }, null); })();


/***/ }),

/***/ "/mFC":
/*!************************************************************!*\
  !*** ./src/app/components/tabs/mytrip/mytrip.component.ts ***!
  \************************************************************/
/*! exports provided: MytripComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MytripComponent", function() { return MytripComponent; });
/* harmony import */ var _environments_environment_dev__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../../../../environments/environment.dev */ "LpW2");
/* harmony import */ var src_app_models_coordinates__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/models/coordinates */ "FvPJ");
/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mapbox-gl */ "4ZJM");
/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(mapbox_gl__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _angular_material_sort__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/sort */ "LUZP");
/* harmony import */ var _add_venue_popover_add_venue_popover_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./add-venue-popover/add-venue-popover.component */ "HSUS");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_components_tabs_mytrip_tripmodal_tripmodal_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! src/app/components/tabs/mytrip/tripmodal/tripmodal.component */ "bDK8");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/expansion */ "o4Yh");
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/table */ "OaSA");
/* harmony import */ var _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/cdk/drag-drop */ "ltgo");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/dialog */ "iELJ");
/* harmony import */ var _services_trip_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./../../../services/trip.service */ "W524");
/* harmony import */ var src_app_services_session_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! src/app/services/session.service */ "IfdK");
/* harmony import */ var src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! src/app/services/map/map.service */ "HYNq");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var src_app_services_http_service__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! src/app/services/http.service */ "N+K7");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/tooltip */ "ZFy/");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/progress-spinner */ "pu8Q");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/material/divider */ "BSbQ");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "G0yt");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/card */ "PDjf");
/* harmony import */ var _angular_material_chips__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @angular/material/chips */ "f44v");
/* harmony import */ var _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! @angular/material/grid-list */ "40+f");
/* harmony import */ var _share_share_component__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ../../share/share.component */ "5ghV");
































function MytripComponent_div_0_div_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "mat-spinner", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_cell_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, " Category ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_11_button_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "button", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "img", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r29 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("matTooltip", element_r29.category.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("src", element_r29.category.url, _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵsanitizeUrl"]);
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_11_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_11_button_1_Template, 2, 2, "button", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r29 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", element_r29.category);
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_cell_13_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, " Venue Name ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_14_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r32 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](element_r32.name);
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_cell_16_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, " City ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_17_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r33 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", element_r33.venueCity, " ");
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_cell_19_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, " Address ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_20_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "p", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r34 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("", element_r34.venueAddress, " ");
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_cell_22_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, " Price ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_23_span_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r35 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("", element_r35.price, "$");
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_23_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_23_span_1_Template, 2, 1, "span", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r35 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", element_r35.price == 0);
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_cell_25_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, " Website ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_26_a_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "a", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "button", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3, "open_in_new");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r38 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("href", element_r38.url, _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("matTooltip", element_r38.url);
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_26_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_26_a_1_Template, 4, 2, "a", 56);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r38 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", element_r38.url);
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_cell_28_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-header-cell", 49);
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_29_Template(rf, ctx) { if (rf & 1) {
    const _r44 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "p", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "button", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_29_Template_button_click_2_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r44); const index_r41 = ctx.index; const j_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().index; const ctx_r42 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](3); return ctx_r42.showLocation(null, j_r12, index_r41, true); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4, "map");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_row_30_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-header-row");
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_row_31_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-row", 61);
} }
function MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-expansion-panel");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-expansion-panel-header");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "mat-panel-description");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](6, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "mat-table", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](9, 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](10, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_cell_10_Template, 2, 0, "mat-header-cell", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](11, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_11_Template, 2, 1, "mat-cell", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](12, 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](13, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_cell_13_Template, 2, 0, "mat-header-cell", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](14, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_14_Template, 2, 1, "mat-cell", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](15, 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](16, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_cell_16_Template, 2, 0, "mat-header-cell", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](17, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_17_Template, 2, 1, "mat-cell", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](18, 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](19, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_cell_19_Template, 2, 0, "mat-header-cell", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](20, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_20_Template, 3, 1, "mat-cell", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](21, 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](22, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_cell_22_Template, 2, 0, "mat-header-cell", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](23, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_23_Template, 2, 1, "mat-cell", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](24, 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](25, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_cell_25_Template, 2, 0, "mat-header-cell", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](26, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_26_Template, 2, 1, "mat-cell", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](27, 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](28, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_cell_28_Template, 1, 0, "mat-header-cell", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](29, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_cell_29_Template, 5, 0, "mat-cell", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](30, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_header_row_30_Template, 1, 0, "mat-header-row", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](31, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_mat_row_31_Template, 1, 0, "mat-row", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const schedule_r11 = ctx.$implicit;
    const j_r12 = ctx.index;
    const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" day ", j_r12 + 1, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate4"](" ", ctx_r10.displayDay(schedule_r11.day), " | ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](6, 8, schedule_r11.day), " \u00A0 \u2014 \u00A0 Locations: ", ctx_r10.getDayVenues(schedule_r11), " \u00A0 \u2014 \u00A0 Price: ", ctx_r10.getDayPrice(schedule_r11), "$ ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("dataSource", ctx_r10.getDataSource(0, j_r12, true));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](22);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("matHeaderRowDef", ctx_r10.displayedColumns);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("matRowDefColumns", ctx_r10.displayedColumns);
} }
function MytripComponent_div_0_mat_expansion_panel_10_Template(rf, ctx) { if (rf & 1) {
    const _r47 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-expansion-panel", 15, 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "mat-expansion-panel-header");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "mat-panel-title", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](6, "button", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_10_Template_button_click_6_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r47); const _r8 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵreference"](1); return _r8.toggle(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "mat-icon", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](8, "link");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](9, "mat-panel-description", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](11, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](12, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](13, "mat-divider", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](15, "span", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_10_Template_span_click_15_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r47); const _r8 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵreference"](1); return _r8.toggle(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](16, "button", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_10_Template_button_click_16_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r47); const ctx_r49 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r49.changeSharingLink(ctx_r49.sharedTrip._id); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](17, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](18, "share");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](19, "button", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_10_Template_button_click_19_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r47); const ctx_r50 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r50.showItinerary(null, true); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](20, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](21, "map");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](22, "button", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_10_Template_button_click_22_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r47); const ctx_r51 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r51.copyTrip(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](23, "mat-icon", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](24, "add");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](25, "mat-card");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](26, "mat-card-content", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](27, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](28, "button", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_10_Template_button_click_28_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r47); const ctx_r52 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r52.TripAccordion.openAll(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](29, "Expand All");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](30, "button", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_10_Template_button_click_30_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r47); const ctx_r53 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r53.TripAccordion.closeAll(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](31, "Collapse All");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](32, "mat-accordion", 27, 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](34, MytripComponent_div_0_mat_expansion_panel_10_mat_expansion_panel_34_Template, 32, 10, "mat-expansion-panel", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](35, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](36, "mat-expansion-panel", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](37, "mat-expansion-panel-header");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](38, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](39, "Trip Overview");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](40, "mat-panel-description");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](41, "All your stats are here");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](42, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](43, "mat-chip-list");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](44, "mat-chip", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](45);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](46, "mat-chip", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](48, "mat-chip", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵreference"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("expanded", ctx_r5.sharedTrip);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", ctx_r5.sharedTrip.tripName, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate2"]("", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](11, 12, ctx_r5.sharedTrip.dateRange.start), " \u2014 ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](12, 14, ctx_r5.sharedTrip.dateRange.end), "\u00A0");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("vertical", true);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("\u00A0", ctx_r5.sharedTrip.dateRange.length, " days");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngbPopover", _r2)("autoClose", "outside");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx_r5.sharedTrip.schedule);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("Distance Traveled: ", ctx_r5.getTripDistance(null, true), " km");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("Places Visited: ", ctx_r5.getTotalVenues(ctx_r5.sharedTrip), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("Price: ", ctx_r5.getTotalPrice(ctx_r5.sharedTrip), "$");
} }
function MytripComponent_div_0_div_12_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 62);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, " \u00A0");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "h2", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3, "No trips Yet...");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_cell_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, " Category ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_11_button_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "button", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "img", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r83 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("matTooltip", element_r83.category.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("src", element_r83.category.url, _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵsanitizeUrl"]);
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_11_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_11_button_1_Template, 2, 2, "button", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r83 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", element_r83.category);
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_cell_13_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, " Venue Name ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_14_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r86 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](element_r86.name);
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_cell_16_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, " City ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_17_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r87 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", element_r87.venueCity, " ");
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_cell_19_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, " Address ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_20_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "p", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r88 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("", element_r88.venueAddress, " ");
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_cell_22_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, " Price ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_23_span_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r89 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("", element_r89.price, "$");
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_23_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_23_span_1_Template, 2, 1, "span", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r89 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", element_r89.price == 0);
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_cell_25_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, " Website ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_26_a_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "a", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "button", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3, "open_in_new");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r92 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("href", element_r92.url, _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("matTooltip", element_r92.url);
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_26_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_26_a_1_Template, 4, 2, "a", 56);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r92 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", element_r92.url);
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_cell_28_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-header-cell", 49);
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_29_Template(rf, ctx) { if (rf & 1) {
    const _r98 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "p", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "button", 73);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_29_Template_button_click_2_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r98); const index_r95 = ctx.index; const j_r61 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().index; const i_r55 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().index; const ctx_r96 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r96.openAddVenueModal(i_r55, j_r61, index_r95); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4, "edit");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "button", 74);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_29_Template_button_click_5_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r98); const index_r95 = ctx.index; const j_r61 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().index; const i_r55 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().index; const ctx_r100 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r100.onDeleteVenue(i_r55, j_r61, index_r95); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](6, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](7, "delete");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "button", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_29_Template_button_click_8_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r98); const index_r95 = ctx.index; const j_r61 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().index; const i_r55 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().index; const ctx_r103 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r103.showLocation(i_r55, j_r61, index_r95); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](9, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](10, "map");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](11, "button", 75);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](12, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](13, "drag_indicator");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_row_30_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-header-row");
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_row_31_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-row", 61);
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_icon_35_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-icon", 76);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, "add_location");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_icon_36_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-icon", 76);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, "done");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_icon_37_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-icon", 77);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, "error");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_spinner_38_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-spinner", 14);
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_small_40_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "small", 78);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, "Schedule Saved Successfully!");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_Template(rf, ctx) { if (rf & 1) {
    const _r108 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-expansion-panel");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-expansion-panel-header");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "mat-panel-description");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](6, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "mat-table", 67);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("cdkDropListDropped", function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_Template_mat_table_cdkDropListDropped_8_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r108); const j_r61 = ctx.index; const i_r55 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().index; const ctx_r107 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r107.onListDrop($event, i_r55, j_r61); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](9, 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](10, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_cell_10_Template, 2, 0, "mat-header-cell", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](11, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_11_Template, 2, 1, "mat-cell", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](12, 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](13, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_cell_13_Template, 2, 0, "mat-header-cell", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](14, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_14_Template, 2, 1, "mat-cell", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](15, 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](16, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_cell_16_Template, 2, 0, "mat-header-cell", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](17, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_17_Template, 2, 1, "mat-cell", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](18, 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](19, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_cell_19_Template, 2, 0, "mat-header-cell", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](20, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_20_Template, 3, 1, "mat-cell", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](21, 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](22, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_cell_22_Template, 2, 0, "mat-header-cell", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](23, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_23_Template, 2, 1, "mat-cell", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](24, 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](25, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_cell_25_Template, 2, 0, "mat-header-cell", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](26, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_26_Template, 2, 1, "mat-cell", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](27, 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](28, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_cell_28_Template, 1, 0, "mat-header-cell", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](29, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_cell_29_Template, 14, 0, "mat-cell", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](30, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_header_row_30_Template, 1, 0, "mat-header-row", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](31, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_row_31_Template, 1, 0, "mat-row", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](32, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](33, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](34, "button", 68);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_Template_button_click_34_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r108); const j_r61 = ctx.index; const i_r55 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().index; const ctx_r110 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r110.openAddVenueModal(i_r55, j_r61, null); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](35, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_icon_35_Template, 2, 0, "mat-icon", 69);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](36, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_icon_36_Template, 2, 0, "mat-icon", 69);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](37, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_icon_37_Template, 2, 0, "mat-icon", 70);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](38, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_mat_spinner_38_Template, 1, 0, "mat-spinner", 71);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](39, " \u00A0 ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](40, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_small_40_Template, 2, 0, "small", 72);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const schedule_r60 = ctx.$implicit;
    const j_r61 = ctx.index;
    const i_r55 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().index;
    const ctx_r59 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" day ", j_r61 + 1, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate4"](" ", ctx_r59.displayDay(schedule_r60.day), " | ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](6, 14, schedule_r60.day), " \u00A0 \u2014 \u00A0 Locations: ", ctx_r59.getDayVenues(schedule_r60), " \u00A0 \u2014 \u00A0 Price: ", ctx_r59.getDayPrice(schedule_r60), "$ ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("dataSource", ctx_r59.getDataSource(i_r55, j_r61))("cdkDropListData", ctx_r59.getDataSource(i_r55, j_r61));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](22);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("matHeaderRowDef", ctx_r59.displayedColumns);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("matRowDefColumns", ctx_r59.displayedColumns);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !ctx_r59.isLoading && !ctx_r59.isErr && !ctx_r59.isSuccess);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !ctx_r59.isLoading && !ctx_r59.isErr && ctx_r59.isSuccess);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !ctx_r59.isLoading && ctx_r59.isErr && !ctx_r59.isSuccess);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r59.isLoading && !ctx_r59.isErr && !ctx_r59.isSuccess);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !ctx_r59.isLoading && !ctx_r59.isErr && ctx_r59.isSuccess);
} }
function MytripComponent_div_0_mat_expansion_panel_13_Template(rf, ctx) { if (rf & 1) {
    const _r114 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-expansion-panel", 15, 63);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "mat-expansion-panel-header", 64);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "mat-panel-title", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "mat-panel-description", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](7, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](8, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](9, "mat-divider", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](11, "span", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_13_Template_span_click_11_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r114); const _r57 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵreference"](1); return _r57.toggle(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](12, "button", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_13_Template_button_click_12_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r114); const trip_r54 = ctx.$implicit; const ctx_r115 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r115.changeSharingLink(trip_r54._id); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](13, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](14, "share");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](15, "button", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_13_Template_button_click_15_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r114); const i_r55 = ctx.index; const ctx_r116 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r116.showItinerary(i_r55); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](16, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](17, "map");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](18, "mat-card");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](19, "mat-card-content", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](20, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](21, "button", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_13_Template_button_click_21_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r114); const ctx_r117 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r117.TripAccordion.openAll(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](22, "Expand All");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](23, "button", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_13_Template_button_click_23_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r114); const ctx_r118 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r118.TripAccordion.closeAll(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](24, "Collapse All");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](25, "mat-accordion", 27, 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](27, MytripComponent_div_0_mat_expansion_panel_13_mat_expansion_panel_27_Template, 41, 16, "mat-expansion-panel", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](28, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](29, "mat-expansion-panel", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](30, "mat-expansion-panel-header");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](31, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](32, "Trip Overview");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](33, "mat-panel-description");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](34, "All your stats are here");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](35, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](36, "mat-chip-list");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](37, "mat-chip", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](39, "mat-chip", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](40);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](41, "mat-chip", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](42);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](43, "mat-card-actions", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](44, "button", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_mat_expansion_panel_13_Template_button_click_44_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r114); const trip_r54 = ctx.$implicit; const i_r55 = ctx.index; const ctx_r119 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r119.onDeleteTrip(trip_r54.tripName, i_r55); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](45, " delete ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](46, "button", 66);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](47, " complete! ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const trip_r54 = ctx.$implicit;
    const i_r55 = ctx.index;
    const isFirst_r56 = ctx.first;
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵreference"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("expanded", isFirst_r56 && !ctx_r7.sharedTrip);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](trip_r54.tripName);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate2"]("", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](7, 12, trip_r54.dateRange.start), " \u2014 ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](8, 14, trip_r54.dateRange.end), "\u00A0");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("vertical", true);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("\u00A0", trip_r54.dateRange.length, " days");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngbPopover", _r2)("autoClose", "outside");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", trip_r54.schedule);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("Distance Traveled: ", ctx_r7.getTripDistance(i_r55), " km");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("Places Visited: ", ctx_r7.getTotalVenues(trip_r54), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("Price: ", ctx_r7.getTotalPrice(trip_r54), "$");
} }
function MytripComponent_div_0_Template(rf, ctx) { if (rf & 1) {
    const _r121 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "button", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function MytripComponent_div_0_Template_button_click_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r121); const ctx_r120 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r120.openAddTripModal(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](5, "add");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](6, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](8, MytripComponent_div_0_div_8_Template, 2, 0, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](9, "mat-accordion", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](10, MytripComponent_div_0_mat_expansion_panel_10_Template, 50, 16, "mat-expansion-panel", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](11, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](12, MytripComponent_div_0_div_12_Template, 4, 0, "div", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](13, MytripComponent_div_0_mat_expansion_panel_13_Template, 48, 16, "mat-expansion-panel", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r0.isLoading && !ctx_r0.trips);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r0.sharedTrip);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !ctx_r0.trips && !ctx_r0.isLoading);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx_r0.trips);
} }
function MytripComponent_mat_grid_list_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-grid-list", 79);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-grid-tile", 80);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "div", 81);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "button", 82);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "p", 83);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](5, "You must have an Account to Create a Trip");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function MytripComponent_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "app-share", 84);
} if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("UrlLink", ctx_r3.sharingUrl);
} }
class MytripComponent {
    constructor(MatDialog, TripService, SessionService, MapService, ActivatedRoute, HttpService) {
        this.MatDialog = MatDialog;
        this.TripService = TripService;
        this.SessionService = SessionService;
        this.MapService = MapService;
        this.ActivatedRoute = ActivatedRoute;
        this.HttpService = HttpService;
        this.isLoading = false;
        this.isErr = false;
        this.isSuccess = false;
        this.sharedTrip = null;
        this.sharingUrl = null;
        this.tableDataSource = new _angular_material_table__WEBPACK_IMPORTED_MODULE_8__["MatTableDataSource"]([]);
        this.displayedColumns = ['category', 'venueName', 'venueCity', 'venueAddress', 'price', 'url', 'index'];
        this.trips = [];
    }
    // display day of date
    displayDay(date) {
        const d = new Date(date);
        const weekday = new Array(7);
        weekday[0] = 'Sun';
        weekday[1] = 'Mon';
        weekday[2] = 'Tue';
        weekday[3] = 'Wed';
        weekday[4] = 'Thu';
        weekday[5] = 'Fri';
        weekday[6] = 'Sat';
        const i = d.getDay();
        return weekday[i];
    }
    // get price for a day w/ schedule obj
    getDayPrice(obj) {
        let total = 0;
        if (obj) {
            const venues = obj.venues ? obj.venues : [];
            for (let x = 0; x < venues.length; x++) {
                venues[x].price ? total += venues[x].price : total += 0;
            }
        }
        return total;
    }
    // use trip object to get price for all days
    getTotalPrice(obj) {
        let total = 0;
        if (obj.schedule) {
            obj.schedule.forEach((element) => {
                total += this.getDayPrice(element);
            });
        }
        return total;
    }
    // get venues for a day w/ schedule obj
    getDayVenues(obj) {
        if (obj) {
            const venues = obj.venues ? obj.venues : [];
            return venues.length;
        }
        else {
            return 0;
        }
    }
    // use trip object to get venues for all days
    getTotalVenues(obj) {
        let total = 0;
        if (obj.schedule) {
            obj.schedule.forEach((element) => {
                total += this.getDayVenues(element);
            });
        }
        return total;
    }
    getTripDistance(tripIndex, shared) {
        let dist = 0;
        let lastCoord = null;
        const obj = shared ? this.sharedTrip : this.trips[tripIndex];
        for (let x = 0; x < obj.schedule.length; x++) {
            obj.schedule[x].venues.forEach((venue) => {
                if (venue.venueCoord) {
                    if (lastCoord === null) {
                        lastCoord = new mapbox_gl__WEBPACK_IMPORTED_MODULE_2__["LngLat"](venue.venueCoord.lng, venue.venueCoord.lat);
                    }
                    dist += lastCoord.distanceTo(venue.venueCoord);
                    lastCoord = new mapbox_gl__WEBPACK_IMPORTED_MODULE_2__["LngLat"](venue.venueCoord.lng, venue.venueCoord.lat);
                }
            });
        }
        return (dist / 1000).toFixed(2);
    }
    getDataSource(tripIndex, dayIndex, shared) {
        const source = new _angular_material_table__WEBPACK_IMPORTED_MODULE_8__["MatTableDataSource"]([]);
        const obj = shared ? this.sharedTrip : this.trips[tripIndex];
        if (obj.schedule) {
            source.data = obj.schedule[dayIndex].venues;
            source.sort = this.sort;
            return source;
        }
        else {
            return source;
        }
    }
    ngOnInit() {
        // if from link
        this.ActivatedRoute.queryParams.subscribe((params) => {
            if (params.tripId) {
                console.log(params);
                this.HttpService.get('/trips', {
                    tripId: params.tripId
                })
                    .then((res) => {
                    this.sharedTrip = res.trip;
                })
                    .catch((err) => {
                    console.log(err);
                })
                    .finally(() => {
                });
            }
        });
        this.isLoading = true;
        this._tripSub = this.TripService.trips.subscribe((trips) => {
            this.trips = trips;
            this.isLoading = false;
            if (this.table) {
                this.table.renderRows();
            }
        });
        this.sessionState_sub = this.SessionService.sessionState.subscribe((state) => {
            this.sessionState = state;
        });
    }
    changeSharingLink(id) {
        this.sharingUrl = _environments_environment_dev__WEBPACK_IMPORTED_MODULE_0__["environment"].travelnetURL + '/mytrip?' + 'tripId=' + id;
    }
    /** copy shared trip to own trip */
    copyTrip() {
        this.trips.push(this.sharedTrip);
        this.isLoading = true;
        this.TripService.modifyBackend(this.trips)
            .then(() => {
            this.isSuccess = true;
        })
            .finally(() => {
            this.isLoading = false;
        });
    }
    /** modal for adding a trip */
    openAddTripModal() {
        this.dialogRef = this.MatDialog.open(src_app_components_tabs_mytrip_tripmodal_tripmodal_component__WEBPACK_IMPORTED_MODULE_6__["TripmodalComponent"], {
            width: '800px',
            data: {
                name: this.name,
                start: this.start,
                end: this.end
            }
        });
        this.dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.trips.push(result);
                this.TripService.updateLocal(this.trips);
            }
        });
    }
    /** modal for adding venue */
    openAddVenueModal(tripIndex, scheduleIndex, venueIndex) {
        this.dialogRef = this.MatDialog.open(_add_venue_popover_add_venue_popover_component__WEBPACK_IMPORTED_MODULE_4__["AddVenuePopoverComponent"], {
            width: '800px',
            data: {
                tripIndex,
                scheduleIndex,
                venueIndex,
                name: this.venueName,
                venuePrice: this.venuePrice,
                venueCity: this.venueCity,
                venueAddress: this.venueAddress
            }
        });
        this.dialogRef.afterClosed().subscribe((result) => {
            // if (result) {
            //   this.trips.push(result)
            //   this.TripService.update(this.trips)
            // }
        });
    }
    /** when row are reordered */
    onListDrop(event, tripIndex, dayIndex) {
        Object(_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_9__["moveItemInArray"])(this.trips[tripIndex].schedule[dayIndex].venues, event.previousIndex, event.currentIndex);
        this.isLoading = true;
        this.TripService.modifyBackend(this.trips)
            .then((res) => {
            this.table.renderRows();
            this.isSuccess = true;
        })
            .catch(() => {
            this.isErr = true;
        })
            .finally(() => {
            this.isLoading = false;
            setTimeout(() => {
                this.isSuccess = false;
                this.isErr = false;
            }, 1000);
        });
    }
    /** delete one venue  */
    onDeleteVenue(tripIndex, dayIndex, venueIndex) {
        if (confirm(`are you sure you want to delete this venue?`)) {
            console.log(this.trips[tripIndex].schedule[dayIndex].venues[venueIndex]);
            this.trips[tripIndex].schedule[dayIndex].venues.splice(venueIndex, 1);
            this.TripService.modifyBackend(this.trips)
                .finally(() => {
                if (this.table) {
                    this.table.renderRows();
                }
            });
        }
        else {
        }
    }
    /** delete entire trip */
    onDeleteTrip(name, index) {
        if (confirm(`are you sure you want to delete ${name}?`)) {
            this.trips.splice(index, 1);
            this.TripService.modifyBackend(this.trips)
                .finally(() => {
                if (this.table) {
                    this.table.renderRows();
                }
            });
        }
        else {
        }
    }
    /** show itinerary of trip on map */
    showItinerary(tripIndex, shared) {
        // already showing itinerary
        if (this.MapService.map.getSource('route')) {
            this.MapService.map.removeLayer('route');
            this.MapService.map.removeSource('route');
            this.MapService.map.removeLayer('points');
            this.MapService.map.removeSource('points');
        }
        const obj = shared ? this.sharedTrip : this.trips[tripIndex];
        // push venues in array
        const coord = [];
        for (const day of obj.schedule) {
            day.venues.forEach((venue) => {
                if (venue.venueCoord) {
                    coord.push([venue.venueCoord.lng, venue.venueCoord.lat]);
                    // show point
                    this.MapService.showMarker(1, {
                        name: venue.name,
                        content: {
                            geometry: {
                                coordinates: [venue.venueCoord.lng, venue.venueCoord.lat]
                            }
                        }
                    });
                }
            });
        }
        // display as route
        this.MapService.map.addSource('route', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: coord
                }
            }
        });
        this.MapService.map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#3bb2d0',
                'line-width': 8
            }
        });
        this.MapService.map.moveLayer('points');
    }
    /** display location of venue on map */
    showLocation(tripIndex, dayIndex, venueIndex, shared) {
        const obj = shared ? this.sharedTrip : this.trips[tripIndex];
        this.MapService.venueOnDestroy();
        const coord = obj.schedule[dayIndex].venues[venueIndex].venueCoord ? new src_app_models_coordinates__WEBPACK_IMPORTED_MODULE_1__["CustomCoordinates"](obj.schedule[dayIndex].venues[venueIndex].venueCoord.lng, obj.schedule[dayIndex].venues[venueIndex].venueCoord.lat) : null;
        if (coord) {
            this.MapService.addMarker(coord);
        }
    }
    ngOnDestroy() {
        this.MapService.venueOnDestroy();
        this._tripSub.unsubscribe();
        this.sessionState_sub.unsubscribe();
        this.MapService.removeMarker('', null, true);
        if (this.MapService.map.getSource('route')) {
            this.MapService.map.removeLayer('route');
            this.MapService.map.removeSource('route');
            this.MapService.map.removeLayer('points');
            this.MapService.map.removeSource('points');
        }
    }
}
MytripComponent.ɵfac = function MytripComponent_Factory(t) { return new (t || MytripComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_10__["MatDialog"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_trip_service__WEBPACK_IMPORTED_MODULE_11__["TripService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](src_app_services_session_service__WEBPACK_IMPORTED_MODULE_12__["SessionService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_13__["MapService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_14__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](src_app_services_http_service__WEBPACK_IMPORTED_MODULE_15__["HttpService"])); };
MytripComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({ type: MytripComponent, selectors: [["app-mytrip"]], viewQuery: function MytripComponent_Query(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵviewQuery"](_angular_material_expansion__WEBPACK_IMPORTED_MODULE_7__["MatAccordion"], true);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵviewQuery"](_angular_material_table__WEBPACK_IMPORTED_MODULE_8__["MatTable"], true);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵviewQuery"](_angular_material_sort__WEBPACK_IMPORTED_MODULE_3__["MatSort"], true);
    } if (rf & 2) {
        var _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵloadQuery"]()) && (ctx.TripAccordion = _t.first);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵloadQuery"]()) && (ctx.table = _t.first);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵloadQuery"]()) && (ctx.sort = _t.first);
    } }, decls: 4, vars: 2, consts: [["style", "position: relative;", 4, "ngIf"], ["cols", "4", 4, "ngIf"], ["popContent", ""], [2, "position", "relative"], [1, "container", 2, "background-color", "rgba(255, 200, 200, 1)", "padding", "1em"], [1, "row", "justify-content-center"], ["mat-mini-fab", "", "matTooltip", "create a new trip", 1, "col-auto", "align-self-center", 3, "click"], [1, "", 2, "max-height", "100%"], ["class", "", 4, "ngIf"], [1, "container-fluid", 2, "min-height", "750px"], [3, "expanded", 4, "ngIf"], ["class", "container-fluid row rounded align--items-center", "style", "background-color: rgba(255, 255, 255, 1); min-height: 100px;", 4, "ngIf"], [3, "expanded", 4, "ngFor", "ngForOf"], [1, ""], ["diameter", "20"], [3, "expanded"], ["shared", ""], [1, "align-self-center"], ["mat-button", "", "matTooltip", "shared trip", 3, "click"], [1, "text-success"], [3, "vertical"], [2, "margin-right", "1em", 3, "click"], ["mat-button", "", "color", "primary", "matTooltip", "share this trp", "container", "body", 3, "ngbPopover", "autoClose", "click"], ["mat-button", "", "color", "accent", "matTooltip", "show itinerary on map", 3, "click"], ["mat-button", "", "matTooltip", "copy this trip", 3, "click"], [1, "example-action-buttons"], ["mat-button", "", 3, "click"], ["multi", ""], ["acc", ""], [4, "ngFor", "ngForOf"], ["expanded", "true"], [1, "row", "container-fluid"], ["color", "primary", "selected", ""], ["color", "warn", "selected", ""], ["color", "accent", "selected", ""], [1, "container-fluid"], ["matSort", "", 2, "width", "100%", 3, "dataSource"], ["matColumnDef", "category"], ["mat-sort-header", "", 4, "matHeaderCellDef"], [4, "matCellDef"], ["matColumnDef", "venueName"], ["matColumnDef", "venueCity"], ["matColumnDef", "venueAddress", 2, "display", "inline-block"], [4, "matHeaderCellDef"], ["matColumnDef", "price"], ["matColumnDef", "url"], ["matColumnDef", "index", "stickyEnd", ""], [4, "matHeaderRowDef"], ["cdkDrag", "", 4, "matRowDef", "matRowDefColumns"], ["mat-sort-header", ""], ["mat-mini-fab", "", "color", "primary", "style", "box-shadow: none;", 3, "matTooltip", 4, "ngIf"], ["mat-mini-fab", "", "color", "primary", 2, "box-shadow", "none", 3, "matTooltip"], ["alt", "", 2, "margin-top", "-0.3em", 3, "src"], [2, "display", "inline-block", "width", "100%"], ["class", "text-center", "style", "width: 100%;", 4, "ngIf"], [1, "text-center", 2, "width", "100%"], ["target", "_blank", 3, "href", "matTooltip", 4, "ngIf"], ["target", "_blank", 3, "href", "matTooltip"], ["mat-button", ""], [1, "text-right", 2, "width", "100%"], ["mat-button", "", "matTooltip", "show location on map", 3, "click"], ["cdkDrag", ""], [1, "container-fluid", "row", "rounded", "align--items-center", 2, "background-color", "rgba(255, 255, 255, 1)", "min-height", "100px"], ["pan", ""], [1, "my-headers-align"], ["mat-button", "", "color", "warn", 3, "click"], ["mat-button", "", "color", "primary"], ["matSort", "", "cdkDropList", "", 2, "width", "100%", 3, "dataSource", "cdkDropListData", "cdkDropListDropped"], ["mat-mini-fab", "", "id", "addIcon", "matTooltip", "add a venue", 1, "col-auto", "align-self-center", 3, "click"], ["id", "addIcon", 4, "ngIf"], ["id", "addIcon", "class", "text-danger", 4, "ngIf"], ["diameter", "20", 4, "ngIf"], ["class", "text-success align-self-center", "style", "vertical-align: middle;", 4, "ngIf"], ["mat-button", "", "matTooltip", "edit venue", 3, "click"], ["mat-button", "", "matTooltip", "delete venue", "color", "warn", 3, "click"], ["mat-button", "", "matTooltip", "drag to reorder schedule", "cdkDragHandle", ""], ["id", "addIcon"], ["id", "addIcon", 1, "text-danger"], [1, "text-success", "align-self-center", 2, "vertical-align", "middle"], ["cols", "4"], ["colspan", "4"], [1, "container-fluid", "row", "justify-content-center", "rounded", 2, "background-color", "rgba(255, 255, 255, 0.9)", "margin", "10%", "padding", "5%"], ["mat-flat-button", "", "color", "accent", "routerLink", "/login", 2, "align-content", "center"], [2, "margin", "0"], [3, "UrlLink"]], template: function MytripComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](0, MytripComponent_div_0_Template, 14, 4, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, MytripComponent_mat_grid_list_1_Template, 6, 0, "mat-grid-list", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](2, MytripComponent_ng_template_2_Template, 1, 1, "ng-template", null, 2, _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplateRefExtractor"]);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx.sessionState);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !ctx.sessionState);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_16__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_17__["MatButton"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_18__["MatTooltip"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_19__["MatIcon"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_7__["MatAccordion"], _angular_common__WEBPACK_IMPORTED_MODULE_16__["NgForOf"], _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_20__["MatSpinner"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_7__["MatExpansionPanel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_7__["MatExpansionPanelHeader"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_7__["MatExpansionPanelTitle"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_7__["MatExpansionPanelDescription"], _angular_material_divider__WEBPACK_IMPORTED_MODULE_21__["MatDivider"], _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_22__["NgbPopover"], _angular_material_card__WEBPACK_IMPORTED_MODULE_23__["MatCard"], _angular_material_card__WEBPACK_IMPORTED_MODULE_23__["MatCardContent"], _angular_material_chips__WEBPACK_IMPORTED_MODULE_24__["MatChipList"], _angular_material_chips__WEBPACK_IMPORTED_MODULE_24__["MatChip"], _angular_material_table__WEBPACK_IMPORTED_MODULE_8__["MatTable"], _angular_material_sort__WEBPACK_IMPORTED_MODULE_3__["MatSort"], _angular_material_table__WEBPACK_IMPORTED_MODULE_8__["MatColumnDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_8__["MatHeaderCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_8__["MatCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_8__["MatHeaderRowDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_8__["MatRowDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_8__["MatHeaderCell"], _angular_material_sort__WEBPACK_IMPORTED_MODULE_3__["MatSortHeader"], _angular_material_table__WEBPACK_IMPORTED_MODULE_8__["MatCell"], _angular_material_table__WEBPACK_IMPORTED_MODULE_8__["MatHeaderRow"], _angular_material_table__WEBPACK_IMPORTED_MODULE_8__["MatRow"], _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_9__["CdkDrag"], _angular_material_card__WEBPACK_IMPORTED_MODULE_23__["MatCardActions"], _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_9__["CdkDropList"], _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_9__["CdkDragHandle"], _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_25__["MatGridList"], _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_25__["MatGridTile"], _angular_router__WEBPACK_IMPORTED_MODULE_14__["RouterLink"], _share_share_component__WEBPACK_IMPORTED_MODULE_26__["ShareComponent"]], pipes: [_angular_common__WEBPACK_IMPORTED_MODULE_16__["DatePipe"]], styles: ["button[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n\n#lineBtn[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n#hrBtn[_ngcontent-%COMP%] {\n  flex: 1;\n  border: none;\n  height: 1px;\n  background: black;\n}\n\n#addIcon[_ngcontent-%COMP%] {\n  transform: scale(0.9);\n}\n\n[_nghost-%COMP%]     .popover {\n  min-width: 400px;\n  z-index: 2006 !important;\n}\n\n.my-headers-align[_ngcontent-%COMP%]   .mat-expansion-panel-header-title[_ngcontent-%COMP%], .my-headers-align[_ngcontent-%COMP%]   .mat-expansion-panel-header-description[_ngcontent-%COMP%] {\n  flex-basis: 0;\n}\n\n.cdk-drag-preview[_ngcontent-%COMP%] {\n  box-sizing: border-box;\n  border-radius: 4px;\n  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);\n}\n\n.cdk-drag-placeholder[_ngcontent-%COMP%] {\n  opacity: 0;\n}\n\n.cdk-drag-animating[_ngcontent-%COMP%] {\n  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);\n}\n\n.cdk-drop-list-dragging[_ngcontent-%COMP%]   .mat-row[_ngcontent-%COMP%]:not(.cdk-drag-placeholder) {\n  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFwuLlxcbXl0cmlwLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0ksYUFBQTtBQUNKOztBQUVBO0VBQ0ksYUFBQTtFQUNBLHVCQUFBO0VBQ0EsbUJBQUE7QUFDSjs7QUFFQTtFQUNJLE9BQUE7RUFDQSxZQUFBO0VBQ0EsV0FBQTtFQUNBLGlCQUFBO0FBQ0o7O0FBRUE7RUFDSSxxQkFBQTtBQUNKOztBQUVBO0VBQ0ksZ0JBQUE7RUFDQSx3QkFBQTtBQUNKOztBQUVBOztFQUVFLGFBQUE7QUFDRjs7QUFFQTtFQUNJLHNCQUFBO0VBQ0Esa0JBQUE7RUFDQSxxSEFBQTtBQUNKOztBQUlFO0VBQ0UsVUFBQTtBQURKOztBQUlFO0VBQ0Usc0RBQUE7QUFESjs7QUFJRTtFQUNFLHNEQUFBO0FBREoiLCJmaWxlIjoibXl0cmlwLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiYnV0dG9uOmZvY3VzIHtcclxuICAgIG91dGxpbmU6IG5vbmU7XHJcbn1cclxuXHJcbiNsaW5lQnRuIHtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcclxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbn1cclxuXHJcbiNockJ0biB7XHJcbiAgICBmbGV4OiAxO1xyXG4gICAgYm9yZGVyOiBub25lO1xyXG4gICAgaGVpZ2h0OiAxcHg7XHJcbiAgICBiYWNrZ3JvdW5kOiBibGFjaztcclxufVxyXG5cclxuI2FkZEljb24ge1xyXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwLjkpO1xyXG59XHJcblxyXG46aG9zdCA6Om5nLWRlZXAgLnBvcG92ZXIge1xyXG4gICAgbWluLXdpZHRoOiA0MDBweDtcclxuICAgIHotaW5kZXg6IDIwMDYgIWltcG9ydGFudDtcclxufVxyXG5cclxuLm15LWhlYWRlcnMtYWxpZ24gLm1hdC1leHBhbnNpb24tcGFuZWwtaGVhZGVyLXRpdGxlLCBcclxuLm15LWhlYWRlcnMtYWxpZ24gLm1hdC1leHBhbnNpb24tcGFuZWwtaGVhZGVyLWRlc2NyaXB0aW9uIHtcclxuICBmbGV4LWJhc2lzOiAwO1xyXG59XHJcblxyXG4uY2RrLWRyYWctcHJldmlldyB7XHJcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xyXG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xyXG4gICAgYm94LXNoYWRvdzogMCA1cHggNXB4IC0zcHggcmdiYSgwLCAwLCAwLCAwLjIpLFxyXG4gICAgICAgICAgICAgICAgMCA4cHggMTBweCAxcHggcmdiYSgwLCAwLCAwLCAwLjE0KSxcclxuICAgICAgICAgICAgICAgIDAgM3B4IDE0cHggMnB4IHJnYmEoMCwgMCwgMCwgMC4xMik7XHJcbiAgfVxyXG4gIFxyXG4gIC5jZGstZHJhZy1wbGFjZWhvbGRlciB7XHJcbiAgICBvcGFjaXR5OiAwO1xyXG4gIH1cclxuICBcclxuICAuY2RrLWRyYWctYW5pbWF0aW5nIHtcclxuICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSAyNTBtcyBjdWJpYy1iZXppZXIoMCwgMCwgMC4yLCAxKTtcclxuICB9XHJcbiAgXHJcbiAgLmNkay1kcm9wLWxpc3QtZHJhZ2dpbmcgLm1hdC1yb3c6bm90KC5jZGstZHJhZy1wbGFjZWhvbGRlcikge1xyXG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDI1MG1zIGN1YmljLWJlemllcigwLCAwLCAwLjIsIDEpO1xyXG4gIH0iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵsetClassMetadata"](MytripComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_5__["Component"],
        args: [{
                selector: 'app-mytrip',
                templateUrl: './mytrip.component.html',
                styleUrls: ['./mytrip.component.scss']
            }]
    }], function () { return [{ type: _angular_material_dialog__WEBPACK_IMPORTED_MODULE_10__["MatDialog"] }, { type: _services_trip_service__WEBPACK_IMPORTED_MODULE_11__["TripService"] }, { type: src_app_services_session_service__WEBPACK_IMPORTED_MODULE_12__["SessionService"] }, { type: src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_13__["MapService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_14__["ActivatedRoute"] }, { type: src_app_services_http_service__WEBPACK_IMPORTED_MODULE_15__["HttpService"] }]; }, { TripAccordion: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_5__["ViewChild"],
            args: [_angular_material_expansion__WEBPACK_IMPORTED_MODULE_7__["MatAccordion"]]
        }], table: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_5__["ViewChild"],
            args: [_angular_material_table__WEBPACK_IMPORTED_MODULE_8__["MatTable"]]
        }], sort: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_5__["ViewChild"],
            args: [_angular_material_sort__WEBPACK_IMPORTED_MODULE_3__["MatSort"]]
        }] }); })();


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! D:\Desktop\travelnet\frontend\src\main.ts */"zUnb");


/***/ }),

/***/ "25Q9":
/*!***************************************************************!*\
  !*** ./src/app/components/chatsystem/chatsystem.component.ts ***!
  \***************************************************************/
/*! exports provided: ChatsystemComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChatsystemComponent", function() { return ChatsystemComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/chatsystem/friendlist.service */ "+7u6");
/* harmony import */ var _services_session_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./../../services/session.service */ "IfdK");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _friendlist_friendlist_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./friendlist/friendlist.component */ "Awxy");
/* harmony import */ var _chatwidget_chatwidget_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./chatwidget/chatwidget.component */ "lumE");







function ChatsystemComponent_app_chatwidget_5_Template(rf, ctx) { if (rf & 1) {
    const _r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "app-chatwidget", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function ChatsystemComponent_app_chatwidget_5_Template_app_chatwidget_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r4); const i_r2 = ctx.index; const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r3.refreshRoom(ctx_r3.openChatWidgets.roomIds[i_r2]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const widget_r1 = ctx.$implicit;
    const i_r2 = ctx.index;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("roomName", widget_r1)("roomId", ctx_r0.openChatWidgets.roomIds[i_r2]);
} }
class ChatsystemComponent {
    constructor(FriendlistService, SessionService) {
        this.FriendlistService = FriendlistService;
        this.SessionService = SessionService;
        this.user = sessionStorage.getItem('username');
        this.SessionService.session();
        this.openChatWidgets_sub = this.FriendlistService.openWidgets.subscribe(x => {
            this.openChatWidgets = x;
        });
        this.sessionState_sub = this.SessionService.sessionState.subscribe(x => {
            this.sessionState = x;
        });
    }
    ngOnInit() {
        this.FriendlistService.getNotifications();
    }
    refreshRoom(roomId) {
        this.FriendlistService.selectChatwidget(roomId);
    }
    ngOnDestroy() {
        this.openChatWidgets_sub.unsubscribe();
        this.sessionState_sub.unsubscribe();
    }
}
ChatsystemComponent.ɵfac = function ChatsystemComponent_Factory(t) { return new (t || ChatsystemComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__["FriendlistService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_session_service__WEBPACK_IMPORTED_MODULE_2__["SessionService"])); };
ChatsystemComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: ChatsystemComponent, selectors: [["app-chatsystem"]], decls: 8, vars: 1, consts: [[1, "container-fluid"], [1, "row-12", "chatwidget"], [1, "col-8", "col-sm-9", "col-md-10", "col-lg-9", "col-xl-10"], [1, "row", "justify-content-end"], [3, "roomName", "roomId", "click", 4, "ngFor", "ngForOf"], [1, "col-4", "col-sm-3", "col-md-2", "col-lg-3", "col-xl-2"], [3, "roomName", "roomId", "click"]], template: function ChatsystemComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](5, ChatsystemComponent_app_chatwidget_5_Template, 1, 2, "app-chatwidget", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](7, "app-friendlist");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.openChatWidgets.roomNames);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_3__["NgForOf"], _friendlist_friendlist_component__WEBPACK_IMPORTED_MODULE_4__["FriendlistComponent"], _chatwidget_chatwidget_component__WEBPACK_IMPORTED_MODULE_5__["ChatwidgetComponent"]], styles: [".chatwidget[_ngcontent-%COMP%] {\n  padding-left: 10px;\n  padding-right: 10px;\n}\n\n.row[_ngcontent-%COMP%] {\n  max-height: 310px;\n}\n\napp-chatwidget[_ngcontent-%COMP%] {\n  z-index: 2;\n  margin-left: 0;\n  margin-right: 0;\n  padding-right: 0px;\n  border-color: 0;\n}\n\napp-friendlist[_ngcontent-%COMP%] {\n  right: 1%;\n  bottom: 2vh;\n  position: fixed;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxjaGF0c3lzdGVtLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0Usa0JBQUE7RUFDQSxtQkFBQTtBQUNGOztBQUVBO0VBQ0UsaUJBQUE7QUFDRjs7QUFFQTtFQUNFLFVBQUE7RUFDQSxjQUFBO0VBQ0EsZUFBQTtFQUNBLGtCQUFBO0VBQ0EsZUFBQTtBQUNGOztBQUVBO0VBQ0UsU0FBQTtFQUNBLFdBQUE7RUFDQSxlQUFBO0FBQ0YiLCJmaWxlIjoiY2hhdHN5c3RlbS5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi5jaGF0d2lkZ2V0IHtcclxuICBwYWRkaW5nLWxlZnQ6IDEwcHg7XHJcbiAgcGFkZGluZy1yaWdodDogMTBweDtcclxufVxyXG5cclxuLnJvd3tcclxuICBtYXgtaGVpZ2h0OiAzMTBweDtcclxufVxyXG5cclxuYXBwLWNoYXR3aWRnZXQge1xyXG4gIHotaW5kZXg6IDI7XHJcbiAgbWFyZ2luLWxlZnQ6IDA7XHJcbiAgbWFyZ2luLXJpZ2h0OiAwO1xyXG4gIHBhZGRpbmctcmlnaHQ6IDBweDtcclxuICBib3JkZXItY29sb3I6IGJsdWUoJGNvbG9yOiAjMDAwMDAwKTtcclxufVxyXG5cclxuYXBwLWZyaWVuZGxpc3Qge1xyXG4gIHJpZ2h0OiAxJTtcclxuICBib3R0b206IDJ2aDtcclxuICBwb3NpdGlvbjogZml4ZWQ7XHJcbn1cclxuXHJcbiJdfQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ChatsystemComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-chatsystem',
                templateUrl: './chatsystem.component.html',
                styleUrls: ['./chatsystem.component.scss']
            }]
    }], function () { return [{ type: src_app_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__["FriendlistService"] }, { type: _services_session_service__WEBPACK_IMPORTED_MODULE_2__["SessionService"] }]; }, null); })();


/***/ }),

/***/ "2CGX":
/*!***********************************************************!*\
  !*** ./src/app/components/profile/mime-type.validator.ts ***!
  \***********************************************************/
/*! exports provided: mimeType */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mimeType", function() { return mimeType; });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ "qCKp");

const mimeType = (control) => {
    if (typeof (control.value) === 'string') {
        return Object(rxjs__WEBPACK_IMPORTED_MODULE_0__["of"])(null);
    }
    const file = control.value;
    const fileReader = new FileReader();
    const frObs = rxjs__WEBPACK_IMPORTED_MODULE_0__["Observable"].create((observer) => {
        fileReader.addEventListener('loadend', () => {
            const arr = new Uint8Array(fileReader.result).subarray(0, 4);
            let header = '';
            let isValid = false;
            for (let i = 0; i < arr.length; i++) {
                header += arr[i].toString(16);
            }
            switch (header) {
                case '89504e47':
                    isValid = true;
                    break;
                case 'ffd8ffe0':
                case 'ffd8ffe1':
                case 'ffd8ffe2':
                case 'ffd8ffe3':
                case 'ffd8ffe8':
                    isValid = true;
                    break;
                default:
                    isValid = false; // Or you can use the blob.type as fallback
                    break;
            }
            if (isValid) {
                observer.next(null);
            }
            else {
                observer.next({ invalidMimeType: true });
            }
            observer.complete();
        });
        fileReader.readAsArrayBuffer(file);
    });
    return frObs;
};


/***/ }),

/***/ "2HSR":
/*!*****************************************************************************!*\
  !*** ./src/app/components/chatsystem/friendlist/friend/friend.component.ts ***!
  \*****************************************************************************/
/*! exports provided: FriendComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FriendComponent", function() { return FriendComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/chatsystem/friendlist.service */ "+7u6");
/* harmony import */ var _services_session_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../services/session.service */ "IfdK");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ "SVse");





class FriendComponent {
    constructor(friendlistService, sessionService) {
        this.friendlistService = friendlistService;
        this.sessionService = sessionService;
        this.username = sessionStorage.getItem('username');
    }
    ngOnInit() {
        this.sessionRoomName = this.sessionService.getRoomName(this.friend.roomName);
    }
    // open or close chat widget
    toggleChatWidget(friend) {
        this.friendlistService.toggleChatWidget(friend);
        this.friendlistService.resizeWindow(window.innerWidth);
    }
}
FriendComponent.ɵfac = function FriendComponent_Factory(t) { return new (t || FriendComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__["FriendlistService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_session_service__WEBPACK_IMPORTED_MODULE_2__["SessionService"])); };
FriendComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: FriendComponent, selectors: [["app-friend"]], inputs: { friend: "friend" }, decls: 2, vars: 2, consts: [["type", "button", 1, "btn", 3, "ngClass", "click"]], template: function FriendComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function FriendComponent_Template_button_click_0_listener() { return ctx.toggleChatWidget(ctx.friend); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngClass", ctx.friend.unread ? "btn-danger" : ctx.friend.open ? "btn-light disabled" : "btn-light");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", ctx.sessionRoomName, "\n");
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_3__["NgClass"]], styles: [".btn[_ngcontent-%COMP%] {\n  width: 100%;\n  border-radius: 0;\n}\n\n.btn-dark[_ngcontent-%COMP%] {\n  color: 203.6363636364deg;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFwuLlxcLi5cXGZyaWVuZC5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLFdBQUE7RUFDQSxnQkFBQTtBQUNKOztBQUVBO0VBQ0ksd0JBQUE7QUFDSiIsImZpbGUiOiJmcmllbmQuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuYnRuIHtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgYm9yZGVyLXJhZGl1czogMDtcclxufVxyXG5cclxuLmJ0bi1kYXJrIHtcclxuICAgIGNvbG9yOiBodWUoJGNvbG9yOiAjOGRiNWNmKTtcclxufSJdfQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](FriendComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-friend',
                templateUrl: './friend.component.html',
                styleUrls: ['./friend.component.scss']
            }]
    }], function () { return [{ type: src_app_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__["FriendlistService"] }, { type: _services_session_service__WEBPACK_IMPORTED_MODULE_2__["SessionService"] }]; }, { friend: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }] }); })();


/***/ }),

/***/ "2MiI":
/*!*******************************************************!*\
  !*** ./src/app/components/header/header.component.ts ***!
  \*******************************************************/
/*! exports provided: HeaderComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HeaderComponent", function() { return HeaderComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_session_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/session.service */ "IfdK");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var _logout_logout_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../logout/logout.component */ "aer8");






function HeaderComponent_a_0_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "a", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "Login");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "span", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function HeaderComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "img", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "button", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5, "Profile");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](6, "app-logout", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("src", ctx_r1.link, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
} }
class HeaderComponent {
    constructor(sessionService) {
        this.sessionService = sessionService;
        // link = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUQEhIWFRUVFRUWFRUVFxUVFhcWFRUWFhUVFRUYHSggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGBAQGisdHR0rLS0tLS0tKy0rLS0tLS0tKy0tLS0tLS0tLS0tLSstLSsrLS0rKy03LS0rLis3Nzc3K//AABEIAOEA4QMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAAAAgMEBQYHAQj/xABEEAACAQIDBQUFBQQJAwUAAAABAgADEQQSIQUGMUFREyJhcZEHMoGhsRQjQmLBFRZS0UNTVHKCkrLh8GPS8SQzc6PC/8QAGgEAAwEBAQEAAAAAAAAAAAAAAAECAwQFBv/EACMRAQEAAgIDAAICAwAAAAAAAAABAhEDIQQSMUFRE2EFIzL/2gAMAwEAAhEDEQA/AO4whCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEZGKTNkzDMOUAehCEAIQhACEIQAhCEAIQhACEIQAiGBvfl0kbDY9WFybGZ7fPbr0UK0z7wsCOV73I+En2lCbtnemlRJRO+449B5mZjE7113/FlH5dPnMjQrEtqbyZL0m1aftWsf6V/wDMYobcxC8Kr+pP1lWpiKrR6TutPgt9ayG1QBx6H1mu2Rt6jiBdCQRxVuI/nOQM8n7Expp1VcciLjqOYi0uV2WETTa4BHMA+s87UXy31iMuEhYjEgOBmta1x5yaDFKBCEIwIQhAEVqgVSx4AE+k5ftDab9q7AnVr6TZb6bQ7OjkB1c/ITnYqc2HHnANrsLe3MMlUXbkeZ85raNQMAwNwZxt6P4lM0+6m8TUj2VbVDwPQ9YHp0CESjggEG4OoIioEIQhACEIQAkPauL7Kkz87WHmZLmU32xRylB+FbnzPD/njAIf7w1P4z8v5QmE/aDdYQPTouK2wzNkyZQOY4zL7zVe0VbakG1hqdeFhJn2WrTYuzLl1vY8B11mX2pvGELJQOp0NX8R8E/hHjxnJxY25bZnKWDFGz4moKXRPeqH/APd+Np5W3iwq6JRd/F2y/ITJV65Y3JJv1jJM7hpqX3qH4cPSHnmJ+ZgN5kPvYdPgWH6zLXnl4DTWptXCP7y1EPgQw9DH8OaJYGnXU+Dgof1ExqtFhzA9PoPZG1kKC7jRRw14DXWU2F2uWqmwuQflOTbJ23Vw7XQ6c1OqsPETY4DatOorVk7psA6XvlOuoPMGc3Lhke2zxTl2NVlsq8T9JabIxrVOHujSZLFYxhRWmPxWYnz4TSbA2gmRUtrwPnM8Lq9lLV9CVeJxQduzU6gyzWdMu1PYQiXawJ6CMK/aeKw9I56ts1tNMxt4DlIWE3gw2Ibslps1+Rpgi3j0EosdTOKBRQe1ZwLk6BeZI6CXyNhtm0BmYDTU8XdvCLZ2DF7r4eprk7I9aZt6rwjbbpYYcS/nmA/SZnaG/dapdaKimvI+838hKOrjKjnM7sx6kkwPTqWzMGlDurVJXkrMpt5SyvOP0cSes3m6W0y4NNjcgXHl0hsXHTSQhCNIhCEADOY744ssxpjXO2ttSddFAE6XUYDQnjp5+ErMDsKjRqNW4seBbXIOYX+cA5R+wK39mrf5DCdZ/eHC/1y/P8AlCI9uQb2baYjswTrq3TwExrveTtrVM1RjfmfTlK+PjxknSCg0sMDsypU1tlXqf0Ec2BgjUqAAXPyHjN5hcEtwKeUge87knXoig/Mx5ZNMcWbwm6ubn+n6Scdz1HK/rNUmFZfdb5C08p4kg5XAH5hw+N+EytybSRgtobtlNRcfOUGIpFDYzrG0VVgRxPCw4jz6THbc2eqi5U687x4ZUs8ZWVBlhsasVqDoe6R1BkN6NuEf2eO+vmPrNcvjCzTsmG2ElSgrtWIsLXFrC2ltYjZdelTfIGza2uBY+cgnapbs6SVFVdBYAm5PMyRtjZTUyGNSp3h+AaA+U48vqWko7LpE5kc348by2Ex+72IFNsqq7Fubf8ANJrO2AsCQDNsMtw4dkbadYJSdybAKTf4STI20sMKtJ6Z/EpHxtp85obGbE24MzVOwqlQLK1gAetrmZ3b9PEY2t2jsEQaIvEqv0vNFjcbTwqIjBicoFgL+vSUGK28p0Ay+dgZFrbGbLwm7tMDWo58rLPcRsNBwDeedv5yAm3cvBh8YPvR4j/nwky2ruOiKmyQLkO4I8SfrJW6GMqpiaa5ibuAb9DoY1T2wKtlIFzYA621lrhdlNh8bh8xWzENcHQW43vKlRlHT4TxWB1Bv5T2WxEIQgEDG5Q4qVHCqik94gC/Wc+3q37aqHoYcWS5BcXLMOdugmv3qajTAr1rGwKKpF7k6g2+ExOKxJ98ilRQ6guyrfyUXPyk2rxx2x3bt0f0MJqft9H+2Yf/AOz/ALJ7F7NPWMnvTslsNiKlIm+VjY2tcHUH0lIBqJ3Tf/dT7Wna0gO1UcOGdel+onMsFst0bs2oqWzHMKgNwBy46TTeoxmO6uNzsIU+9ADAEZrakX4XHSZt8VURy6k3DNqPMzf7CyqrFe4DdTlOlrWlHX2A6E9jaqpN8p7resx9m8wUmF2/iVOjk+B1kw7Xr1e43BtLW6ySdiVR3jQy/wB6ooHy1lvsnC4dLPVZM/4QDe3w6xXNcwZ3CbWqYY1EK5mLXu3gLRrG7fasjU6qgDiuW/veMvtvYOjWbPSYZhxB0vKd8ItPWpTbzykqfIjSEzH8aiHeHlJe71BzWVlXNlN9eEtamFWupqU6ZWmgs76AlmNlAXideMVhr0e4BlI46a/GVcunPy3tpqFaqSAqqh6hBf1tJVeu7ns3drjmSbesraeP91c1uF2PLxltjsMK1vsh7Sw74/8A1f8ASc1mVY7Wm7GGCZ2LF3sSo5W6DxicBtE1apVlsc2oPnwlXsr7UHKpTYEDidF05ay62Tsyqana1gF56HUnx6TTHdOVpozjEJpuAbEqwB6EjSOU3DC44GeVXABJ4AazpU4hteg4az3Olwbk38bymNBiw87Tp+91CgQLHKCLiy38x4THk0Kfeu7W1va0wuVdmOrNon7MNiMtiPnKw4U3vaaY7w0igUU2Ntbjj855h6quMwpafmuD6Sd1V1VThcE1s3C0sKlZhlYsWPAkm+kexuLGQIoCjnae7JwbVmVALkmXE5adE3IzfZRe/vNa/S//AJmgkfA4cU6a0xwUASRNnJfohEVqoUZibASsG3EszHS3DxkZcmOP0mL342ZiKqO7kHIxyqOOW/G85zh6JzWPPTWde2htMVqVVT3TlNvED9ZzzCYqhSJquuZgwyA8B4mY4ZWuvHPHKRF/YDQl3++yf1aekJe6vUdkmX322aroKoGo7pPgeF5p7xNRAwKkXB4gzS6sceN1duV08M1Kll5XkP8AaLKdDNpvRsdKdM1FLXJsbm4t4DlOd4jjMLNOrHLfbR4LEdsO8dOcrcdsXCZy3bWPi3DykPCJmuC5VfDjJVOuiDLTpg9S4DE/KJaGuyaOcMK4Nuh18pYYvHFVyqTaQ8VVD6MiL4qAD6iQ2vwveGhtb7OpvUR1AJB4gc7SRisalSnZ6QZ1UIrcCLcC3WRFcrSVFBzOSRboBrIlFsxC8LkD1Mpxc17PLhLrqbHz0my3Jxi0r0WyqDqCT3mMgfu+WAVWUshtUubKb8Msdw2xFViQHNVSMqjUHr5CKXtjidr46otWo3a90MQo56S92DTrt36jnIR7p1J9eAjuzthqD2lWzuTe1tB8OcuQJpjh3urkegTwi+k9hNTYbezYhRCyXKkk3JJIJ5HwmEbFmn3LcfC87jWphlKkXBFj8ZyDe7Y1TDPe3ducj9Ry+Mi4tMctINJyfwP8x+kS+Mqg2ym3jK5a9c/01h8IipXYHVy0Xqr3iY9S5mw9n1W1cDqrfSYUMeM3242xamVsQ4KrkYJfQkkcfKOROWXTooM8drAmVuwMSjUAysDb3uoPjKDbG06hqMlPgToSdCYs8/WMrdPNv7aa5BsB+HxPlM99rqZS2ZbWJ1He06CRsXhKzuDUcLrbS7WPgBwi8Y5VcqkG2mbiRfnmnJ9u2f1C7SsUWte3eHA3b4jpJG0KqURlFO5q962W5v0HSKoVFPEkZfxDUX8ZHxmKLd1m1PuVBoAeh6TTHcrTjuqh/aH/ALM/+U/yhIv2LE/xn/NCa7dHu7dVxuVgttOfhHnr2NjoLcf0iwVbXQ2jOKxtJELOwyjj/IDnF639s9z9KTefFh6DgcVNz5Xtf1nLscxvpN+N4abYsC33LL2ZB4WPMjzkXb/s/Y3qYSqBxPZvw8g385cwPHPTD4evbjLTD4ymBoLmVuKxFTDN2eKw5Q8Lkd0+IPAxB2nQ5LaF462x5Yl4qrmN+ERhqRd1RRcsQAOpjeHxlA8SZtNxsCMzYpUJVFbKTxY/lk+hZckavZmw6SUkVkBZR7xGoJ42MYw+6mHSqKoBJGoBta/WMYPfjBVHWn2uVm4BwV16X4TRK99RHv8ADDLG36pV2CTVdywCsb2W+b1Mt8JhEpjKo+PEnzMcEVHjJ+k609hEu3Dznt5oHsJ5eF4B7KHfbZ/bYSovNRnXzH+15e3iXsRY2sdLHnAPnTFYd04xigrMwUAsSbADUkzrG824IqHPh3CXOqMCR5qRwj+6G6VLCtnqXeryciyjwUfqYtq6Nbo7jqgWtigGfitP8KefUy+3y2kMPhHI95hkQeLaaeQl4Jyv2l7QL4kUb92mo0/M2pP0jkSp9jbUekCAxAbQ68RLVMQTqGZiNVBPOZXtQuplzg6+kWWEv1JaNXLsoVndtAo4AczeWY3eqsB90C3QmyD+8TqfhDA7SZeEusPtnrObLjs+NuKYflUndSo+lSqoH8Cg5R8J5idymy2FUEdCD8jNFQx1NjYNr46SFtfbS0xZTdvkJnP5NunLDi1tRfuXX/rh857E/tmr/GfWE11mx/1kNt2oT77eplfi9os5sWPrK6nV1jOa5M6ZIw3asGqzrm62O7bD02JucoB+Gk40rTovs7xNqNjwVyPXWBRrsdgKVZTTqorqeTC857vF7NE1qYUhRzpsdP8AC36GdKBvrKvbePWnlQ8XJ9BHDc23c3EqVKl6/cRTqLjM3gLcp1jDYdaahEACgWAHC0qKDrxj2G2uvbdg3Md09fCOwtuL707ONLEVqTC2WozIfysbrabT2cbUxDYZzUfMFbKgPH4nnLH2i7B7Ve1Qd9R6gcjIm71E0sFTUaMWv8SZzeTlqdOrxsPa6q52ltxqbqMx4a24ekaG1Kj/APtve9yQSF+EotsU3D983J6SCrFTppOTHOvdx/x3FnxzX1oq+26ytldT3VZj3r6gXFiJnv30xBDd1Rfhx+fWWOArLUbLV/ECobmLyn3k2eMIyh0zlvcytoQOZ00ms1Xj+T4+fBl605T32rm1woHTW1+slptzHNqobX8WU6jpeL2Phr1KidlTRqQVruQQQ4uCpUGS62JC6km46Hu/7yv493448ssv2TgMbigWas2VTbTTXyEstnY01MRSF9MzH4KpMzlXFEnrL3c5c9dj/BSPq5A+gm+OOk7v5bim+YAyPjX0yjiY5hhYW8Y2V70rWwh4vaS4WiXqm4UadSeSzje0MY1aq9VuLsSfjwE33tSxVqdKkPxEsfJRYfWc5AlwnmVb5iOEmUakgVDchfiY8HjpLRK9ot8dYSr7WNVa0nQS32g99DFJi2c2PGVueO0W1EDXMI12ohDQUdF9THabSNh6bMwVQSzGwA5kzb4bckhAazdkRfOxZSPCw5RXKRXrWYQzb+z6p3ai/mB+UxuOp01crSqdoo/HawJ8Oo8Zp/Z+2tT/AA/rDYkbqjWdPdNx0PLykXGYD7Qc1S4Ye6RpaSLx6lUAl45QZRB2fh2Q5W18Z7itnB3zDRhqPMSZ2gvEvUsQZbNHfEtUSzqQy3BvzHWU+OJRKZVCVBJNuXHW00GOOYZhK6ie7Y+M4PLjv8TPV2qaYFfI/HKxDeXKVONcFyQOdhHBiTSdghtqY2tZSVJFtRc8jOKbj6Tj48sL7fZrouphHQBiP+eMudtqKuFLEAlFDA/6hKzaNSormovu8iNRbxkjFtajX5fcXIHC/lHjlfaOHzd58ct0zmDxpRcoYkHl0HS8aq4sk8ZSDEHrH6FTWerI+dt2tu2mu9nLXNdvBB/qmCarNx7M27lc/mX6GMm3pNrHCbyKGi3q2BJ5An0hJ2K5/vbROLx/YBrLTQAnpzPmdRMvt3AfZqppZswABBHQ9R1jeL2s/wBoeujWZmY9dCeEc2fgquNrZL3ZtXc8FUc/9pPrn7/0rePr/appHi3WLLTprbh4Qga1BYWNmGp66iYrerYX2Sp3SWpt7jHjpxB8ZrpKlLROaRqlYXtFZ4iO545TeRc09DwC17aeyt7Wew0ZpKhFirEEcCCQR5ES22JjyamTEVHqU3RkYOzMBmFwRfmCBKJTJuyj96h8ZnlIqWplLB1AmfIcgNsxFgZrfZ9/SnxX6GZTadYhuzDNlUAWLE3PEkzUez9rJUP5h9Iopt80M0j9rA1YGeepbWIqVrjQxo1BGbgaCaY5M8sSlxlgViFqgAnoCZEqMASx4CVu18bkphPxPqfATzvL5fbKYx6Hg8NzsivBLsbakkmS6DAU6iNbNoQD08JX4OsVa/rJVQq4zcU5H8SHp5Tn9tPpOW9zH8QjD4hkNla1zr09JO2lUdaGIapa5phQRwN5VGnZwh5kfWS976pNAoOLOoA8o8JvOOH/ACWUmPU+sFnkilWtJm8O7dTCJTqM6sHtcDQqxF7W5+coXq6iez66fMLYVp0b2bN9zVP/AFB/pnLKdSdL9nFX7h//AJD9BFQ22aVm8+N7PC1WvY5SB5nSSe0mX9omJthct/ecfLWOBzZnm23AxKU0qu7KtyoBYgcBrxmBapItWpc8Y5Sdex2+WFp/0uc9E73z4TFbz71/agqBMqqb6m5JmUUz0mV7B52veJjwrSAD3iY4jayLQsFM9LRlWiDUiCTmhI+eENh4ryy2M33q+Eo6byZgcXka56GGSossfXBqMQb6zY7jVPuW/v8A6Cc4avczbbk4j7lv7/6CRpcbXtp528ru2h20RrA4iR6uKkN6/jIgrBuYy8zOfl5NdRrhjv6kNVLkHkDceJ6+QkHGgM2eo+vIDgB0kDFYis7Wp6Lf3uVvDrPDhaa953Zz4mw9Jzzj73XZhy3D/npNqBG4MR84oKyWKEZRxHXzErqe0kvYAeklDF+Bl/xytp5nJ+eyqFY1KykaBdT8I3t/bHY1qDccvfZfA6Sl2tRYHtqLWP4lvoZX1sR23eY3NrX8uU04uH1y25fK8u8s1rSfvbvR9rKqqZVQki5uSTp8JQ8dYnEYe2oN40lSd1u3mpSPOjezyv8AcOP+ofoJzIPOhez1vuX8XPyAiDcLVmK9pOK0pJ4sfoJqhVnP/aFiL1kXon1McDK1XkfPCq8YDQB/PPC8avEloE8B1MepiRqJuTJfCIFM9oI8j+8fCPAWgDuaEazQgEJKmkWKshUn5SZSwxPE2gZQqTWbn49aaOHNtQRfymboUwDJBrRHLpsq+8dMaKC3jwEg1d5ah90KPnMu1aeCrFYqXt0LC4gtTUtxIF44KqD3uEo8HjPu115Tyrirzkv114w/tPaOuWn8AJWGjVqaM2URavdgqkAnnwicVUZGyIcxMJ2raUUp4dbpq3NmNz/tGae1i+l7ykzNVbK5sL6ywXF06C5KY48THobWBxI5zP4vuVDbgdY6+0bnhK/G1yxzcuE1wY8mtHmxGkj5r+MjmrG+1mzmTu0A4qRNvuBib06gHJr+oH8pg6de4sZotyMSyVzTHuspJ814QJ0dapnPd9K+bEnwUD9Zte2nOt4a2bEVD+a3pGFTiW0jYMTiWjYaIHS0SWiM0SWjIvDtqZKc30kOhzMeDmASlW0S72jQqGIqNAHM8JHzT2BvKaqvDU9ZJFTSV2eL7WASzVnnayJ2kO0iCUas8FSRTUhngF1h8fYAXi6208o1MpmZGTvEh1PdsNCDyMby3mOWEdvFbl1Gh2NiDUqg3tbXlNNTxJBICrY8TzMwGznKVAwPCasY3nF0jKWXsztjDhQXHIXvf9Jla+PJFrDz5y62jizVugHdHGUWLwxErHtFtTcFiqR0qFvp841jsSGNkFlHAfqeplbFXmmpGe6ezTzPGrwvBJ9H1mj3Sqf+oU/lb6TKhpod0n+9v4GBOhGtOc7Tq3q1D+ZvrNs+InO8TUu7H8x+soEk3iDAGetEBmiGM8vEsYAunUtJCVQZCpi8dFOATI1UaID2jRe8CPZp5Gs0IGjgz3NGQ89zwBzNPc8ZzQzRA9mhmjWaF4bPR0mS8OM2khKLy+wgAQWEx5ctOvxt40wMHbUm1pY7NxIykHrIWKr8hrI5qlbqDpIwtrTllqyBuDbmYy9OGCcldY6xm2MctZrE6MfON5o/jxZzPMAil7NwIPrbSWzprNANE1NDaAMCOZpf7sNZr+J+kzkv933AA84BqqtXQ+UwtR9T5zW16uh8jMYx1jB0NPc0YBhniI4xjbGBeNkxgugbSR2kjrpPS0AUxngMRmhmgC7z2N5oQBmeQhEBPTCEA9EWIQidOB2lLjBe4YQmHK6sfiMvOJr+8Z5CLA807C+4I6YQm8cWX1QbR98xnD+8POEJUZX6RieJnlOEIE9lxsTh8YQgF5U4HyMyTcYQjBM8hCJL2JXjCEDOTwwhGHhnkIQJ5CEIB//Z'
        this.link = 'https://cdn.discordapp.com/attachments/681368843951538206/792228230189940756/icon.png';
        this.sessionState_sub = this.sessionService.sessionState.subscribe((username) => {
            this.sessionState = username;
            if (username) {
                this.username = sessionStorage.getItem('username');
            }
            else {
                this.username = '';
            }
        });
    }
    ngOnInit() {
    }
    ngOnDestroy() {
        this.sessionState_sub.unsubscribe();
    }
}
HeaderComponent.ɵfac = function HeaderComponent_Factory(t) { return new (t || HeaderComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_session_service__WEBPACK_IMPORTED_MODULE_1__["SessionService"])); };
HeaderComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: HeaderComponent, selectors: [["header-navbar"]], decls: 2, vars: 2, consts: [["class", "btn btn-primary", "routerLink", "login", 4, "ngIf"], ["class", "nav-item topIcon", 4, "ngIf"], ["routerLink", "login", 1, "btn", "btn-primary"], [1, "sr-only"], [1, "nav-item", "topIcon"], ["id", "icon", 1, "dropdown"], ["data-toggle", "dropdown", "aria-haspopup", "true", "aria-expanded", "false", "alt", "Settings", 1, "img-thumbnail", "dropdown-toggle", 3, "src"], [1, "dropdown-menu", "dropdown-menu-right"], ["routerLink", "profile", 1, "btn", "btn-secondary", "dropdown-item"], [1, "dropdown-item"]], template: function HeaderComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](0, HeaderComponent_a_0_Template, 3, 0, "a", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, HeaderComponent_div_1_Template, 7, 1, "div", 1);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", !ctx.sessionState);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.sessionState);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_2__["NgIf"], _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterLinkWithHref"], _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterLink"], _logout_logout_component__WEBPACK_IMPORTED_MODULE_4__["LogoutComponent"]], styles: ["#logo[_ngcontent-%COMP%] {\n  position: relative;\n  top: 15px;\n  width: 500%;\n  border-radius: 10%;\n}\n\n#searchResultsContainer[_ngcontent-%COMP%] {\n  background-color: rgba(255, 255, 255, 0.9);\n}\n\n.row[_ngcontent-%COMP%] {\n  z-index: 1;\n  padding-top: 0.8%;\n}\n\n.input[_ngcontent-%COMP%] {\n  padding: 2%;\n  width: 100%;\n}\n\nimg[_ngcontent-%COMP%] {\n  max-width: 60px;\n}\n\n#header[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.topButton[_ngcontent-%COMP%] {\n  top: 15px;\n  position: relative;\n  max-width: 40%;\n}\n\n.topIcon[_ngcontent-%COMP%] {\n  top: 10px;\n  position: relative;\n  max-width: 25%;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxoZWFkZXIuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxrQkFBQTtFQUNBLFNBQUE7RUFDQSxXQUFBO0VBQ0Esa0JBQUE7QUFDRjs7QUFFQTtFQUNJLDBDQUFBO0FBQ0o7O0FBRUE7RUFDSSxVQUFBO0VBQ0EsaUJBQUE7QUFDSjs7QUFHQTtFQUNJLFdBQUE7RUFDQSxXQUFBO0FBQUo7O0FBR0E7RUFDRSxlQUFBO0FBQUY7O0FBRUE7RUFDRSxXQUFBO0FBQ0Y7O0FBQ0E7RUFDRSxTQUFBO0VBQ0Esa0JBQUE7RUFDQSxjQUFBO0FBRUY7O0FBQUE7RUFDRSxTQUFBO0VBQ0Esa0JBQUE7RUFDQSxjQUFBO0FBR0YiLCJmaWxlIjoiaGVhZGVyLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiI2xvZ28ge1xyXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICB0b3A6IDE1cHg7XHJcbiAgd2lkdGg6IDUwMCU7XHJcbiAgYm9yZGVyLXJhZGl1czogMTAlO1xyXG59XHJcblxyXG4jc2VhcmNoUmVzdWx0c0NvbnRhaW5lciB7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwyNTUsMjU1LCAkYWxwaGE6IDAuOSk7XHJcbn1cclxuXHJcbi5yb3cge1xyXG4gICAgei1pbmRleDogMTtcclxuICAgIHBhZGRpbmctdG9wOiAwLjglO1xyXG4gICAgLy8gYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMCwyNTUsMjU1LDApO1xyXG59XHJcblxyXG4uaW5wdXQge1xyXG4gICAgcGFkZGluZzogMiU7XHJcbiAgICB3aWR0aDogMTAwJTtcclxufVxyXG5cclxuaW1nIHtcclxuICBtYXgtd2lkdGg6IDYwcHg7XHJcbn1cclxuI2hlYWRlcntcclxuICB3aWR0aDogMTAwJTtcclxufVxyXG4udG9wQnV0dG9ue1xyXG4gIHRvcDogMTVweDtcclxuICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgbWF4LXdpZHRoOiA0MCU7XHJcbn1cclxuLnRvcEljb257XHJcbiAgdG9wOiAxMHB4O1xyXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICBtYXgtd2lkdGg6IDI1JTtcclxufVxyXG4iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](HeaderComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'header-navbar',
                templateUrl: './header.component.html',
                styleUrls: ['./header.component.scss'],
            }]
    }], function () { return [{ type: src_app_services_session_service__WEBPACK_IMPORTED_MODULE_1__["SessionService"] }]; }, null); })();


/***/ }),

/***/ "3AFk":
/*!*******************************************************************!*\
  !*** ./src/app/components/search-posts/search-posts.component.ts ***!
  \*******************************************************************/
/*! exports provided: SearchPostsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SearchPostsComponent", function() { return SearchPostsComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/input */ "e6WT");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");









class SearchPostsComponent {
    constructor(router) {
        this.router = router;
    }
    ngOnInit() {
        this.form = new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroup"]({
            input: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](null, {
                validators: []
            })
        });
    }
    onSearchPost() {
        if (this.form.invalid) {
            return;
        }
        const input = this.form.get('input').value;
        if (input) {
            this.router.navigate(['/home', input]);
        }
    }
}
SearchPostsComponent.ɵfac = function SearchPostsComponent_Factory(t) { return new (t || SearchPostsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"])); };
SearchPostsComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: SearchPostsComponent, selectors: [["app-search-posts"]], decls: 5, vars: 1, consts: [[3, "formGroup", "submit"], ["matInput", "", "type", "text", "formControlName", "input", "placeholder", "search a post..."], ["mat-raised-button", "", "color", "accent", "type", "submit"]], template: function SearchPostsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "form", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("submit", function SearchPostsComponent_Template_form_submit_0_listener() { return ctx.onSearchPost(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-form-field");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "input", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "button", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4, "Search");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("formGroup", ctx.form);
    } }, directives: [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroupDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_3__["ɵa"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_4__["MatFormField"], _angular_material_input__WEBPACK_IMPORTED_MODULE_5__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControlName"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_3__["ɵk"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_3__["ɵe"], _angular_material_button__WEBPACK_IMPORTED_MODULE_6__["MatButton"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzZWFyY2gtcG9zdHMuY29tcG9uZW50LnNjc3MifQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](SearchPostsComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-search-posts',
                templateUrl: './search-posts.component.html',
                styleUrls: ['./search-posts.component.scss']
            }]
    }], function () { return [{ type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] }]; }, null); })();


/***/ }),

/***/ "4eJP":
/*!*********************************************************!*\
  !*** ./src/app/components/add-tag/add-tag.component.ts ***!
  \*********************************************************/
/*! exports provided: AddTagComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AddTagComponent", function() { return AddTagComponent; });
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/environments/environment */ "AytR");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common/http */ "IheW");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/input */ "e6WT");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");










class AddTagComponent {
    constructor(http) {
        this.http = http;
    }
    ngOnInit() {
        this.form = new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormGroup"]({
            tag: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, {
                validators: []
            })
        });
    }
    onSubmit() {
        this.onAddTag(sessionStorage.getItem('username'), this.form.get('tag').value);
    }
    onAddTag(username, tag) {
        this.http
            .put(src_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].travelnetURL + "api/user/addTag/", { 'username': username, 'tag': tag })
            .subscribe((response) => {
            console.log(response);
        });
    }
}
AddTagComponent.ɵfac = function AddTagComponent_Factory(t) { return new (t || AddTagComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_3__["HttpClient"])); };
AddTagComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: AddTagComponent, selectors: [["app-add-tag"]], decls: 5, vars: 1, consts: [[3, "formGroup", "submit"], ["matInput", "", "type", "text", "formControlName", "tag", "placeholder", "add a tag"], ["mat-raised-button", "", "color", "accent", "type", "submit"]], template: function AddTagComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "form", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("submit", function AddTagComponent_Template_form_submit_0_listener() { return ctx.onSubmit(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "mat-form-field");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](2, "input", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "button", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](4, "Add");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("formGroup", ctx.form);
    } }, directives: [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormGroupDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_4__["ɵa"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_5__["MatFormField"], _angular_material_input__WEBPACK_IMPORTED_MODULE_6__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControlName"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_4__["ɵk"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_4__["ɵe"], _angular_material_button__WEBPACK_IMPORTED_MODULE_7__["MatButton"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJhZGQtdGFnLmNvbXBvbmVudC5zY3NzIn0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](AddTagComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"],
        args: [{
                selector: 'app-add-tag',
                templateUrl: './add-tag.component.html',
                styleUrls: ['./add-tag.component.scss']
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_3__["HttpClient"] }]; }, null); })();


/***/ }),

/***/ "5ghV":
/*!*****************************************************!*\
  !*** ./src/app/components/share/share.component.ts ***!
  \*****************************************************/
/*! exports provided: ShareComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ShareComponent", function() { return ShareComponent; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/input */ "e6WT");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_cdk_clipboard__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/cdk/clipboard */ "Tr4x");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ "SVse");










function ShareComponent_small_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "small", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "Copied To Clipboard");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
class ShareComponent {
    constructor() {
        this.shareForm = null;
        this.copied = false;
    }
    ngOnInit() {
        this.shareForm = new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroup"]({
            urlLinkControl: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](null)
        });
        this.shareForm.get('urlLinkControl').patchValue(this.UrlLink ? this.UrlLink : 'czi');
    }
    onCopyClick() {
        this.copied = true;
    }
}
ShareComponent.ɵfac = function ShareComponent_Factory(t) { return new (t || ShareComponent)(); };
ShareComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: ShareComponent, selectors: [["app-share"]], inputs: { UrlLink: "UrlLink" }, decls: 9, vars: 3, consts: [[3, "formGroup"], ["appearance", "outline"], ["matInput", "", "formControlName", "urlLinkControl", "type", "text", "readonly", "", "aria-readonly", "true"], ["mat-button", "", "type", "button", 3, "cdkCopyToClipboard", "click"], ["class", "text-success", 4, "ngIf"], [1, "text-success"]], template: function ShareComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "form", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "mat-form-field", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3, "Shareable Link");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](4, "input", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "button", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function ShareComponent_Template_button_click_5_listener() { return ctx.onCopyClick(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](6, "Copy");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](7, " \u00A0 ");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](8, ShareComponent_small_8_Template, 2, 0, "small", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("formGroup", ctx.shareForm);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("cdkCopyToClipboard", ctx.shareForm.get("urlLinkControl").value);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.copied);
    } }, directives: [_angular_forms__WEBPACK_IMPORTED_MODULE_0__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroupDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_2__["ɵa"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_3__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_3__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_4__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControlName"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_2__["ɵk"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_2__["ɵe"], _angular_material_button__WEBPACK_IMPORTED_MODULE_5__["MatButton"], _angular_cdk_clipboard__WEBPACK_IMPORTED_MODULE_6__["CdkCopyToClipboard"], _angular_common__WEBPACK_IMPORTED_MODULE_7__["NgIf"]], styles: ["button[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxzaGFyZS5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLGFBQUE7QUFDSiIsImZpbGUiOiJzaGFyZS5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbImJ1dHRvbjpmb2N1cyB7XHJcbiAgICBvdXRsaW5lOiBub25lO1xyXG59Il19 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](ShareComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"],
        args: [{
                selector: 'app-share',
                templateUrl: './share.component.html',
                styleUrls: ['./share.component.scss']
            }]
    }], function () { return []; }, { UrlLink: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"]
        }] }); })();


/***/ }),

/***/ "7A62":
/*!*******************************************************************!*\
  !*** ./src/app/components/profile/proprety/proprety.component.ts ***!
  \*******************************************************************/
/*! exports provided: PropretyComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PropretyComponent", function() { return PropretyComponent; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! moment */ "wd/R");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var src_app_services_http_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/services/http.service */ "N+K7");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "G0yt");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");
/* harmony import */ var _angular_material_radio__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/radio */ "zQhy");











function PropretyComponent_h3_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](2, "titlecase");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](3, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](2, 2, ctx_r0.proprety), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", ctx_r0.propretyValue, " ");
} }
function PropretyComponent_form_2_div_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "label", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](3, "titlecase");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](4, "input", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"]("Old ", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](3, 1, ctx_r3.proprety), "");
} }
function PropretyComponent_form_2_div_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](2, "titlecase");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](3, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" Invalid ", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](2, 1, ctx_r4.proprety), "! ");
} }
function PropretyComponent_form_2_input_7_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "input", 10);
} }
const _c0 = function () { return { year: 1900, month: 1, day: 1 }; };
const _c1 = function () { return { year: 2020, month: 1, day: 1 }; };
function PropretyComponent_form_2_div_8_Template(rf, ctx) { if (rf & 1) {
    const _r12 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "input", 11, 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("ngModelChange", function PropretyComponent_form_2_div_8_Template_input_ngModelChange_1_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r12); const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2); return ctx_r11.model = $event; });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "div", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "button", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function PropretyComponent_form_2_div_8_Template_button_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r12); const _r10 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](2); return _r10.toggle(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](6, "calendar_today");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("minDate", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction0"](3, _c0))("maxDate", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction0"](4, _c1))("ngModel", ctx_r6.model);
} }
function PropretyComponent_form_2_div_9_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "mat-radio-group", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "mat-radio-button", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3, "Male");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "mat-radio-button", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5, "Female");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "mat-radio-button", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](7, "Other");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
function PropretyComponent_form_2_button_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "button", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "Confirm");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
function PropretyComponent_form_2_button_11_Template(rf, ctx) { if (rf & 1) {
    const _r15 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "button", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function PropretyComponent_form_2_button_11_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r15); const ctx_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2); return ctx_r14.onClick(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "Cancel");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
function PropretyComponent_form_2_Template(rf, ctx) { if (rf & 1) {
    const _r17 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "form", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("ngSubmit", function PropretyComponent_form_2_Template_form_ngSubmit_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r17); const ctx_r16 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r16.onSubmit(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](2, PropretyComponent_form_2_div_2_Template, 5, 3, "div", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "label", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](5, "titlecase");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](6, PropretyComponent_form_2_div_6_Template, 4, 3, "div", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](7, PropretyComponent_form_2_input_7_Template, 1, 0, "input", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](8, PropretyComponent_form_2_div_8_Template, 7, 5, "div", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](9, PropretyComponent_form_2_div_9_Template, 8, 0, "div", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](10, PropretyComponent_form_2_button_10_Template, 2, 0, "button", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](11, PropretyComponent_form_2_button_11_Template, 2, 0, "button", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("formGroup", ctx_r1.changeForm);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r1.proprety == "password");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"]("New ", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](5, 9, ctx_r1.proprety), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r1.invalid);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r1.proprety != "birthdate" && ctx_r1.proprety != "gender");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r1.proprety == "birthdate");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r1.proprety == "gender");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r1.changing);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r1.changing);
} }
function PropretyComponent_button_3_Template(rf, ctx) { if (rf & 1) {
    const _r19 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "button", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function PropretyComponent_button_3_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r19); const ctx_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r18.onClick(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](2, "titlecase");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"]("Change ", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](2, 1, ctx_r2.proprety), "");
} }
class PropretyComponent {
    constructor(httpService) {
        this.httpService = httpService;
    }
    ngOnInit() {
        // special forms that need validations
        if (this.proprety == 'email') {
            this.changeForm = new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroup"]({
                newPropretyValue: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](this.propretyValue, [_angular_forms__WEBPACK_IMPORTED_MODULE_0__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_0__["Validators"].email])
            });
        }
        else if (this.proprety == 'password') {
            this.propretyValue = '••••••••';
            this.changeForm = new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroup"]({
                oldPassword: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](null, [_angular_forms__WEBPACK_IMPORTED_MODULE_0__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_0__["Validators"].minLength(5)]),
                newPropretyValue: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](null, [_angular_forms__WEBPACK_IMPORTED_MODULE_0__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_0__["Validators"].minLength(5)])
            });
        }
        else { // everything else
            if (this.proprety == 'birthdate') {
                this.propretyValue = this.propretyValue.slice(0, 10);
            }
            this.changeForm = new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroup"]({
                newPropretyValue: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](this.propretyValue, [_angular_forms__WEBPACK_IMPORTED_MODULE_0__["Validators"].required])
            });
        }
    }
    // changing between form and h3 with old proprety
    onClick() {
        this.changing = !this.changing;
    }
    // once a new proprety is submitted
    onSubmit() {
        const requestedChange = {
            username: this.username,
            proprety: this.proprety,
            newProprety: this.changeForm.get('newPropretyValue').value
        };
        if (this.changeForm.valid) {
            this.invalid = false;
            if (this.proprety == 'password') {
                // implement old password
            }
            else if (this.proprety == 'birthdate') {
                requestedChange.newProprety = moment__WEBPACK_IMPORTED_MODULE_2__(requestedChange.newProprety);
            }
            this.httpService.patch('/user/edit', requestedChange).then((res) => {
                console.log(res);
                window.location.reload();
            }).catch((err) => {
                console.log(err);
            });
        }
        else {
            this.invalid = true;
        }
    }
}
PropretyComponent.ɵfac = function PropretyComponent_Factory(t) { return new (t || PropretyComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](src_app_services_http_service__WEBPACK_IMPORTED_MODULE_3__["HttpService"])); };
PropretyComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: PropretyComponent, selectors: [["app-proprety"]], inputs: { username: "username", proprety: "proprety", propretyValue: "propretyValue" }, decls: 4, vars: 3, consts: [[4, "ngIf"], [3, "formGroup", "ngSubmit", 4, "ngIf"], ["class", "btn btn-danger", 3, "click", 4, "ngIf"], [3, "formGroup", "ngSubmit"], [1, "form-group"], ["for", "newPropretyValue"], ["type", "text", "formControlName", "newPropretyValue", "class", "form-control", 4, "ngIf"], ["class", "btn btn-danger", "type", "submit", 4, "ngIf"], ["class", "btn btn-light", "id", "cancel", 3, "click", 4, "ngIf"], ["type", "text", "formControlName", "oldPassword", 1, "form-control"], ["type", "text", "formControlName", "newPropretyValue", 1, "form-control"], ["placeholder", "yyyy-mm-dd", "formControlName", "newPropretyValue", "name", "dp", "ngbDatepicker", "", 3, "minDate", "maxDate", "ngModel", "ngModelChange"], ["d", "ngbDatepicker"], [1, "input-group-append"], ["id", "calendar", "type", "button", 1, "btn", "btn-outline-secondary", "calendar", 3, "click"], ["aria-label", "Select an option", "formControlName", "newPropretyValue", 1, "row"], ["value", "Male", 1, "col-4"], ["value", "Female", 1, "col-4"], ["value", "Other", 1, "col-4"], ["type", "submit", 1, "btn", "btn-danger"], ["id", "cancel", 1, "btn", "btn-light", 3, "click"], [1, "btn", "btn-danger", 3, "click"]], template: function PropretyComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, PropretyComponent_h3_1_Template, 5, 4, "h3", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](2, PropretyComponent_form_2_Template, 12, 11, "form", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](3, PropretyComponent_button_3_Template, 3, 3, "button", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", !ctx.changing);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.changing);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", !ctx.changing);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_4__["NgIf"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroupDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_5__["ɵa"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControlName"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_5__["ɵk"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_5__["ɵe"], _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_6__["NgbInputDatepicker"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_7__["MatIcon"], _angular_material_radio__WEBPACK_IMPORTED_MODULE_8__["MatRadioGroup"], _angular_material_radio__WEBPACK_IMPORTED_MODULE_8__["MatRadioButton"]], pipes: [_angular_common__WEBPACK_IMPORTED_MODULE_4__["TitleCasePipe"]], styles: ["#calendar[_ngcontent-%COMP%] {\n  margin-top: 2%;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFwuLlxccHJvcHJldHkuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxjQUFBO0FBQ0oiLCJmaWxlIjoicHJvcHJldHkuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIjY2FsZW5kYXIge1xyXG4gICAgbWFyZ2luLXRvcDogMiU7XHJcbn0iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](PropretyComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"],
        args: [{
                selector: 'app-proprety',
                templateUrl: './proprety.component.html',
                styleUrls: ['./proprety.component.scss']
            }]
    }], function () { return [{ type: src_app_services_http_service__WEBPACK_IMPORTED_MODULE_3__["HttpService"] }]; }, { username: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"]
        }], proprety: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"]
        }], propretyValue: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"]
        }] }); })();


/***/ }),

/***/ "9W9C":
/*!*******************************************************!*\
  !*** ./src/app/services/map/openstreetmap.service.ts ***!
  \*******************************************************/
/*! exports provided: OpenstreetmapService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OpenstreetmapService", function() { return OpenstreetmapService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/environments/environment */ "AytR");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "IheW");




class OpenstreetmapService {
    constructor(http) {
        this.http = http;
    }
    onSendRequest(bbox) {
        return this.http
            .get(src_environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].openstreetmap.searchNodes, {
            headers: {},
            params: {
                bbox,
            }
        });
    }
    /** search for cities with nominatim (geojson response) coord as [lng, lat] */
    citySearch(city) {
        return this.http
            .get(src_environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].nominatim.search, {
            headers: {},
            params: {
                city,
                format: 'geojson'
            }
        });
    }
    /** reverse geocoding */
    reverseSearch(lng, lat) {
        return this.http
            .get(src_environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].nominatim.reverse, {
            params: {
                format: 'geojson',
                zoom: '10',
                lat: lat.toString(),
                lon: lng.toString()
            }
        });
    }
}
OpenstreetmapService.ɵfac = function OpenstreetmapService_Factory(t) { return new (t || OpenstreetmapService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"])); };
OpenstreetmapService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: OpenstreetmapService, factory: OpenstreetmapService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](OpenstreetmapService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"] }]; }, null); })();


/***/ }),

/***/ "AALG":
/*!************************************************************************************************!*\
  !*** ./src/app/components/registration-process/country-selector/country-selector.component.ts ***!
  \************************************************************************************************/
/*! exports provided: CountrySelectorComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CountrySelectorComponent", function() { return CountrySelectorComponent; });
/* harmony import */ var _environments_environment_prod__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../../../../environments/environment.prod */ "cxbk");
/* harmony import */ var country_list__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! country-list */ "pHmk");
/* harmony import */ var country_list__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(country_list__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var countries_list__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! countries-list */ "g57A");
/* harmony import */ var countries_list__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(countries_list__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/services/map/map.service */ "HYNq");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common/http */ "IheW");
/* harmony import */ var _services_http_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./../../../services/http.service */ "N+K7");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _city_search_city_search_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../city-search/city-search.component */ "tuAr");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_chips__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/chips */ "f44v");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");














const _c0 = ["citySearch"];
function CountrySelectorComponent_div_11_mat_chip_6_mat_icon_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "mat-icon", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1, "cancel");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} }
function CountrySelectorComponent_div_11_mat_chip_6_Template(rf, ctx) { if (rf & 1) {
    const _r11 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "mat-chip", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("removed", function CountrySelectorComponent_div_11_mat_chip_6_Template_mat_chip_removed_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r11); const place_r7 = ctx.$implicit; const i_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]().index; const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](); return ctx_r9.onRemove(place_r7, i_r4); });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](2, CountrySelectorComponent_div_11_mat_chip_6_mat_icon_2_Template, 2, 0, "mat-icon", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    const place_r7 = ctx.$implicit;
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"](" ", place_r7, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx_r6.removable);
} }
function CountrySelectorComponent_div_11_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 8, 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](2, "button", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](4, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](5, "mat-chip-list", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](6, CountrySelectorComponent_div_11_mat_chip_6_Template, 3, 2, "mat-chip", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](7, "hr");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    const Place_r3 = ctx.$implicit;
    const i_r4 = ctx.index;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("hidden", Place_r3.places.length == 0 ? true : false);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"](" ", Place_r3.continent, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx_r1.allPlaces[i_r4].places);
} }
function CountrySelectorComponent_button_14_Template(rf, ctx) { if (rf & 1) {
    const _r13 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "button", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function CountrySelectorComponent_button_14_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r13); const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](); return ctx_r12.onClear(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1, "Clear");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} }
class CountrySelectorComponent {
    constructor(MapService, Http, HttpService) {
        this.MapService = MapService;
        this.Http = Http;
        this.HttpService = HttpService;
        this.citySearchAppearance = 'standard';
        this.citySearchPlaceholder = 'Search for Locations';
        this.allPlaces = [
            { code: 'NA', continent: 'North-America', places: [] },
            { code: 'SA', continent: 'South-America', places: [] },
            { code: 'EU', continent: 'Europe', places: [] },
            { code: 'AS', continent: 'Asia', places: [] },
            { code: 'AF', continent: 'Africa', places: [] },
            { code: 'OC', continent: 'Oceania', places: [] },
            { code: 'AN', continent: 'Antarctica', places: [] }
        ];
        this.removable = true;
    }
    ngOnInit() {
    }
    ngAfterContentInit() {
        // display city where user clicked
        this.clickLocation_sub = this.MapService.clickLocation.subscribe((x) => {
            if (this.progressUpdate && this.target == this.progressUpdate) {
                if (x.lng != null) {
                    this.Http.get(_environments_environment_prod__WEBPACK_IMPORTED_MODULE_0__["environment"].mapbox.geocoding.concat('/', x.lng.toString(), ',', x.lat.toString(), '.json'), {
                        headers: {},
                        params: {
                            access_token: _environments_environment_prod__WEBPACK_IMPORTED_MODULE_0__["environment"].mapbox.token,
                            types: 'country,region,district,place',
                            language: _environments_environment_prod__WEBPACK_IMPORTED_MODULE_0__["environment"].language
                        }
                    })
                        .subscribe((response) => {
                        if (response.features[0]) {
                            const placeName = response.features[0].place_name;
                            const chip = this.citySearchComponent.removeMiddle(placeName, 1);
                            this.getKey(response.features[response.features.length - 1].properties.short_code.toUpperCase())
                                .then((value) => {
                                const continent = value.continent;
                                this.allPlaces.forEach((element) => {
                                    if (element.code === continent && !element.places.includes(chip)) {
                                        element.places.push(chip);
                                        this.MapService.showMarker(this.target, {
                                            name: chip,
                                            content: {
                                                geometry: {
                                                    coordinates: response.query
                                                }
                                            }
                                        });
                                    }
                                });
                            })
                                .catch((err) => {
                                console.log(err);
                            });
                        }
                    }, (err) => {
                        console.log(err);
                    });
                }
            }
        });
    }
    ngAfterViewInit() {
        this.optionClick_sub = this.citySearchComponent.clickedOption.subscribe(content => {
            if (content) {
                // displays chip and clear search input
                const chip = this.citySearchComponent.removeMiddle(content.name, 1);
                const countryName = ((content.name.split(', '))[content.name.split(', ').length - 1]).substring(1);
                const code = Object(country_list__WEBPACK_IMPORTED_MODULE_1__["getCode"])(countryName);
                this.getKey(code)
                    .then((value) => {
                    const continent = value.continent;
                    this.allPlaces.forEach((element) => {
                        if (element.code === continent && !element.places.includes(chip)) {
                            element.places.push(chip);
                        }
                    });
                })
                    .catch((err) => {
                    console.log(err);
                });
                // show location on map
                content.name = this.citySearchComponent.removeMiddle(content.name, 1);
                this.MapService.showMarker(this.target, content);
            }
        });
    }
    // search Countrieslist countries
    getKey(code) {
        return new Promise((resolve, reject) => {
            const value = Object.keys(countries_list__WEBPACK_IMPORTED_MODULE_3__["countries"]).find(key => {
                if (key === code) {
                    resolve(countries_list__WEBPACK_IMPORTED_MODULE_3__["countries"][key]);
                }
            });
            if (!value) {
                reject('not found');
            }
        });
    }
    // remove chips
    onRemove(place, index) {
        const placesArr = this.allPlaces[index].places;
        placesArr.splice(placesArr.indexOf(place), 1);
        this.MapService.removeMarker(place, this.target);
    }
    onClear() {
        this.allPlaces.forEach(element => {
            element.places = [];
        });
        this.MapService.removeMarker('', null, true);
    }
    // send data to backend
    onSumbit() {
        return new Promise((resolve, reject) => {
            this.HttpService.patch('/user/edit', {
                username: localStorage.getItem('username').toString(),
                proprety: (this.target == 1) ? 'history' : 'wishlist',
                newProprety: this.allPlaces
            })
                .then((response) => {
                resolve(response);
            })
                .catch(err => {
                reject(err);
            });
        });
    }
    ngOnDestroy() {
        this.clickLocation_sub.unsubscribe();
        this.optionClick_sub.unsubscribe();
    }
}
CountrySelectorComponent.ɵfac = function CountrySelectorComponent_Factory(t) { return new (t || CountrySelectorComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_4__["MapService"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_5__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_http_service__WEBPACK_IMPORTED_MODULE_6__["HttpService"])); };
CountrySelectorComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({ type: CountrySelectorComponent, selectors: [["app-country-selector"]], viewQuery: function CountrySelectorComponent_Query(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵviewQuery"](_c0, true);
    } if (rf & 2) {
        var _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵloadQuery"]()) && (ctx.citySearchComponent = _t.first);
    } }, inputs: { progressUpdate: "progressUpdate", target: "target" }, decls: 16, vars: 6, consts: [[1, "example-form", "row", "align-items-center"], [1, "col", 3, "appearance", "placeholder", "clearOnSearch", "getFakeCenterCity"], ["citySearch", ""], [1, "col-auto", "mr-auto"], ["mat-button", ""], ["id", "mainList", 3, "hidden", 4, "ngFor", "ngForOf"], [1, "row-auto"], ["mat-button", "", "color", "warn", 3, "click", 4, "ngIf"], ["id", "mainList", 3, "hidden"], ["mainlist", ""], ["mat-raised-button", "", "aria-orientation", "vertical", 1, "mat-chip-list-stacked"], [1, ""], [3, "removed", 4, "ngFor", "ngForOf"], [3, "removed"], ["matChipRemove", "", "class", "", 4, "ngIf"], ["matChipRemove", "", 1, ""], ["mat-button", "", "color", "warn", 3, "click"]], template: function CountrySelectorComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "form", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](1, "app-city-search", 1, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](3, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](4, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](5, "strong");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](6, "Or");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](7, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](8, "button", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](9, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](10, "Click on the map");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](11, CountrySelectorComponent_div_11_Template, 8, 3, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](12, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](13, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](14, CountrySelectorComponent_button_14_Template, 2, 0, "button", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](15, "br");
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("appearance", ctx.citySearchAppearance)("placeholder", ctx.citySearchPlaceholder)("clearOnSearch", true)("getFakeCenterCity", false);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](10);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx.allPlaces);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", true);
    } }, directives: [_angular_forms__WEBPACK_IMPORTED_MODULE_7__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_7__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_7__["NgForm"], _city_search_city_search_component__WEBPACK_IMPORTED_MODULE_8__["CitySearchComponent"], _angular_material_button__WEBPACK_IMPORTED_MODULE_9__["MatButton"], _angular_common__WEBPACK_IMPORTED_MODULE_10__["NgForOf"], _angular_common__WEBPACK_IMPORTED_MODULE_10__["NgIf"], _angular_material_chips__WEBPACK_IMPORTED_MODULE_11__["MatChipList"], _angular_material_chips__WEBPACK_IMPORTED_MODULE_11__["MatChip"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_12__["MatIcon"], _angular_material_chips__WEBPACK_IMPORTED_MODULE_11__["MatChipRemove"]], styles: ["mat-chip-list[_ngcontent-%COMP%] {\n  padding: 1%;\n}\n\n#mainList[_ngcontent-%COMP%] {\n  padding-bottom: 0;\n}\n\nhr[_ngcontent-%COMP%] {\n  margin-top: 0;\n}\n\nbutton[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFwuLlxcY291bnRyeS1zZWxlY3Rvci5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLFdBQUE7QUFDSjs7QUFFQTtFQUNJLGlCQUFBO0FBQ0o7O0FBRUE7RUFDSSxhQUFBO0FBQ0o7O0FBRUE7RUFDSSxhQUFBO0FBQ0oiLCJmaWxlIjoiY291bnRyeS1zZWxlY3Rvci5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIm1hdC1jaGlwLWxpc3R7XHJcbiAgICBwYWRkaW5nOiAxJTtcclxufVxyXG5cclxuI21haW5MaXN0IHtcclxuICAgIHBhZGRpbmctYm90dG9tOiAwO1xyXG59XHJcblxyXG5ociB7XHJcbiAgICBtYXJnaW4tdG9wOiAwO1xyXG59XHJcblxyXG5idXR0b246Zm9jdXMge1xyXG4gICAgb3V0bGluZTogbm9uZTtcclxufSJdfQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵsetClassMetadata"](CountrySelectorComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_2__["Component"],
        args: [{
                selector: 'app-country-selector',
                templateUrl: './country-selector.component.html',
                styleUrls: ['./country-selector.component.scss']
            }]
    }], function () { return [{ type: src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_4__["MapService"] }, { type: _angular_common_http__WEBPACK_IMPORTED_MODULE_5__["HttpClient"] }, { type: _services_http_service__WEBPACK_IMPORTED_MODULE_6__["HttpService"] }]; }, { citySearchComponent: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_2__["ViewChild"],
            args: ['citySearch']
        }], progressUpdate: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_2__["Input"]
        }], target: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_2__["Input"]
        }] }); })();


/***/ }),

/***/ "AKBL":
/*!*************************************************************!*\
  !*** ./src/app/components/myaccount/myaccount.component.ts ***!
  \*************************************************************/
/*! exports provided: MyaccountComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MyaccountComponent", function() { return MyaccountComponent; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_http_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/services/http.service */ "N+K7");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "SVse");







function MyaccountComponent_div_7_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "img", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "button", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3, "Change Profile Picture");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("src", ctx_r1.imagePreview, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"]);
} }
class MyaccountComponent {
    constructor(httpService) {
        this.httpService = httpService;
    }
    ngOnInit() {
        this.form = new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroup"]({
            picture: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](null, [])
        });
    }
    onImagePicked(event) {
        const file = event.target.files[0];
        this.form.patchValue({ picture: file });
        this.form.get('picture').updateValueAndValidity;
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview = reader.result.toString();
        };
        console.log(this.form);
        reader.readAsDataURL(file);
    }
    onSubmit() {
        const imageData = new FormData();
        imageData.append('username', sessionStorage.getItem('username'));
        imageData.append('image', this.form.value.picture, 'profilepicture');
        this.httpService.post('/user/profilepicture', imageData).then((res) => {
            console.log('profile picture updated succesfully!');
        }).catch((err) => {
            console.log(err);
        });
    }
}
MyaccountComponent.ɵfac = function MyaccountComponent_Factory(t) { return new (t || MyaccountComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](src_app_services_http_service__WEBPACK_IMPORTED_MODULE_2__["HttpService"])); };
MyaccountComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: MyaccountComponent, selectors: [["app-myaccount"]], decls: 10, vars: 2, consts: [[3, "formGroup", "ngSubmit"], ["type", "button", 1, "btn", "btn-danger", "button", 3, "click"], ["type", "file", "accept", "image/*", 2, "visibility", "hidden", 3, "change"], ["filePicker", ""], ["class", "image-preview", 4, "ngIf"], [1, "image-preview"], ["alt", "Invalid File", 3, "src"], ["type", "submit", 1, "btn", "btn-primary"]], template: function MyaccountComponent_Template(rf, ctx) { if (rf & 1) {
        const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "h1");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "Change Profile Picture");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "form", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("ngSubmit", function MyaccountComponent_Template_form_ngSubmit_2_listener() { return ctx.onSubmit(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "button", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function MyaccountComponent_Template_button_click_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r2); const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](6); return _r0.click(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](4, "Upload Profile Picture");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "input", 2, 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("change", function MyaccountComponent_Template_input_change_5_listener($event) { return ctx.onImagePicked($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](7, MyaccountComponent_div_7_Template, 4, 1, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](8, "h1");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](9, "Change Preferences");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("formGroup", ctx.form);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.imagePreview && ctx.imagePreview !== "" && ctx.form.get("picture").valid);
    } }, directives: [_angular_forms__WEBPACK_IMPORTED_MODULE_0__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroupDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_3__["ɵa"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_3__["ɵi"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_3__["ɵj"], _angular_common__WEBPACK_IMPORTED_MODULE_4__["NgIf"]], styles: [".image-preview[_ngcontent-%COMP%] {\n  height: 5rem;\n  margin: 1rem 0;\n}\n\n.image-preview[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  height: 100%;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxteWFjY291bnQuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxZQUFBO0VBQ0EsY0FBQTtBQUNKOztBQUVBO0VBQ0ksWUFBQTtBQUNKIiwiZmlsZSI6Im15YWNjb3VudC5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi5pbWFnZS1wcmV2aWV3IHtcclxuICAgIGhlaWdodDogNXJlbTtcclxuICAgIG1hcmdpbjogMXJlbSAwO1xyXG59XHJcblxyXG4uaW1hZ2UtcHJldmlldyBpbWcge1xyXG4gICAgaGVpZ2h0OiAxMDAlO1xyXG59Il19 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](MyaccountComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"],
        args: [{
                selector: 'app-myaccount',
                templateUrl: './myaccount.component.html',
                styleUrls: ['./myaccount.component.scss']
            }]
    }], function () { return [{ type: src_app_services_http_service__WEBPACK_IMPORTED_MODULE_2__["HttpService"] }]; }, null); })();


/***/ }),

/***/ "ApTs":
/*!*********************************************!*\
  !*** ./src/app/models/geocodeResp.model.ts ***!
  \*********************************************/
/*! exports provided: geocodeResponseModel */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "geocodeResponseModel", function() { return geocodeResponseModel; });
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/environments/environment */ "AytR");

/** response from openstreetmaps api /search, coord as [lng, lat] */
class geocodeResponseModel {
    constructor(name, coord, content) {
        this.name = name;
        this.content = {
            geometry: {
                coordinates: [src_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].montrealCoord.lng, src_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].montrealCoord.lat]
            }
        };
        if (content) {
            this.content = content;
        }
        else {
            this.content.geometry.coordinates = coord;
        }
    }
}


/***/ }),

/***/ "Awxy":
/*!**************************************************************************!*\
  !*** ./src/app/components/chatsystem/friendlist/friendlist.component.ts ***!
  \**************************************************************************/
/*! exports provided: FriendlistComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FriendlistComponent", function() { return FriendlistComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/chatsystem/friendlist.service */ "+7u6");
/* harmony import */ var _services_session_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../services/session.service */ "IfdK");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _friend_friend_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./friend/friend.component */ "2HSR");







function FriendlistComponent_div_0_div_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "app-friend", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const friend_r3 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("friend", friend_r3);
} }
function FriendlistComponent_div_0_Template(rf, ctx) { if (rf & 1) {
    const _r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](2, FriendlistComponent_div_0_div_2_Template, 2, 1, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "form", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("submit", function FriendlistComponent_div_0_Template_form_submit_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r5); const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵreference"](5); const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r4.onSubmit(_r2.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "input", 5, 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("keyup", function FriendlistComponent_div_0_Template_input_keyup_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r5); const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵreference"](5); const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r6.onKey(_r2.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx_r0.friends);
} }
class FriendlistComponent {
    constructor(friendlistService, SessionService) {
        this.friendlistService = friendlistService;
        this.SessionService = SessionService;
        this.friends = [];
    }
    ngOnInit() {
        // setup sessionState and friends observable
        this.sessionSub = this.SessionService.sessionState.subscribe((isLoggedIn) => {
            this.sessionState = isLoggedIn;
            if (isLoggedIn) {
                this.friendsSub = this.friendlistService.chatroomList.subscribe((friends) => this.friends = friends);
                this.friendlistService.getList([]);
            }
            else {
                console.log(`not logged in`);
            }
        });
    }
    // update friendlist on each key press
    onKey(data) {
        if (data === '') {
            this.friendlistService.getList([sessionStorage.getItem('username')]);
        }
        else {
            const arr = data.split(' ');
            this.friendlistService.getList(arr);
        }
    }
    // creates new room on submit
    onSubmit(data) {
        this.friendlistService.CreateChatroom(data);
    }
    ngOnDestroy() {
        this.friendsSub.unsubscribe();
        this.sessionSub.unsubscribe();
    }
}
FriendlistComponent.ɵfac = function FriendlistComponent_Factory(t) { return new (t || FriendlistComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__["FriendlistService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_session_service__WEBPACK_IMPORTED_MODULE_2__["SessionService"])); };
FriendlistComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: FriendlistComponent, selectors: [["app-friendlist"]], decls: 1, vars: 1, consts: [["class", "border border-secondary", 4, "ngIf"], [1, "border", "border-secondary"], ["id", "friends"], ["id", "friend", 4, "ngFor", "ngForOf"], [3, "submit"], ["type", "text", "placeholder", "Add a friend!", "id", "input", "autocomplete", "off", 1, "form-control", "rounded-0", 3, "keyup"], ["input", ""], ["id", "friend"], [3, "friend"]], template: function FriendlistComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](0, FriendlistComponent_div_0_Template, 6, 1, "div", 0);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.sessionState);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_3__["NgIf"], _angular_common__WEBPACK_IMPORTED_MODULE_3__["NgForOf"], _angular_forms__WEBPACK_IMPORTED_MODULE_4__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgForm"], _friend_friend_component__WEBPACK_IMPORTED_MODULE_5__["FriendComponent"]], styles: ["#id[_ngcontent-%COMP%] {\n  color: 18;\n}\n\n#input[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n#friends[_ngcontent-%COMP%] {\n  max-height: 90%;\n  overflow-y: auto;\n}\n\n#friend[_ngcontent-%COMP%] {\n  position: -webkit-sticky;\n  position: sticky;\n  bottom: 0;\n  right: 0;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFwuLlxcZnJpZW5kbGlzdC5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLFNBQUE7QUFDRjs7QUFFQTtFQUNFLFdBQUE7QUFDRjs7QUFFQTtFQUNFLGVBQUE7RUFDQSxnQkFBQTtBQUNGOztBQUVBO0VBQ0Usd0JBQUE7RUFBQSxnQkFBQTtFQUNBLFNBQUE7RUFDQSxRQUFBO0FBQ0YiLCJmaWxlIjoiZnJpZW5kbGlzdC5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIiNpZCB7XHJcbiAgY29sb3I6cmVkKCRjb2xvcjogIzEyMzQ1NSk7XHJcbn1cclxuXHJcbiNpbnB1dCB7XHJcbiAgd2lkdGg6IDEwMCU7XHJcbn1cclxuXHJcbiNmcmllbmRzIHtcclxuICBtYXgtaGVpZ2h0OiA5MCU7XHJcbiAgb3ZlcmZsb3cteTogYXV0bztcclxufVxyXG5cclxuI2ZyaWVuZCB7XHJcbiAgcG9zaXRpb246IHN0aWNreTtcclxuICBib3R0b206IDA7XHJcbiAgcmlnaHQ6IDA7XHJcbn0iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](FriendlistComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-friendlist',
                templateUrl: './friendlist.component.html',
                styleUrls: ['./friendlist.component.scss']
            }]
    }], function () { return [{ type: src_app_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__["FriendlistService"] }, { type: _services_session_service__WEBPACK_IMPORTED_MODULE_2__["SessionService"] }]; }, null); })();


/***/ }),

/***/ "AytR":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
/* harmony import */ var _app_models_coordinates__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../app/models/coordinates */ "FvPJ");

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const environment = {
    production: false,
    travelnetURL: 'http://localhost:3000',
    mapbox: {
        token: 'pk.eyJ1IjoidHJhdmVsbmV0IiwiYSI6ImNrOTk3cHkwaDAzaHkzZHEwMm03ZGN0MG8ifQ.j24u0Q5RbYw7PW4tVpGjmQ',
        geocoding: 'https://api.mapbox.com/geocoding/v5/mapbox.places'
    },
    foursquare: {
        clientId: 'NYZJ324E5GAY2MSQUNYIYLKIDCMX2ETMQREKQXZLW3S5ZYVG',
        clientSecret: 'K51P2Y1T3TMTCU24LOFHDFOAONPGU44ZBNZCGTWCOJESUW4A',
        v: '',
        venuesSearch: 'https://api.foursquare.com/v2/venues/search',
        venuesExplore: 'https://api.foursquare.com/v2/venues/explore',
        venueDetails: 'https://api.foursquare.com/v2/venues',
        userAuth: 'https://foursquare.com/oauth2/authenticate',
        getCategories: 'https://api.foursquare.com/v2/venues/categories',
    },
    nominatim: {
        search: 'https://nominatim.openstreetmap.org/search',
        reverse: 'https://nominatim.openstreetmap.org/reverse'
    },
    openstreetmap: {
        searchNodes: 'https://master.apis.dev.openstreetmap.org/api/0.6/map',
        searchRealNode: ' https://api.openstreetmap.org/api/0.6/map'
    },
    travelnet: {
        getUserInfo: 'http://localhost:3000/user',
        getProfile: 'http://localhost:3000/profile',
        searchUsers: 'http://localhost:3000/searchusers',
        travelnetCommentURL: 'http://localhost:3000/comments',
        travelnetPostURL: 'http://localhost:3000/posts',
    },
    montrealCoord: new _app_models_coordinates__WEBPACK_IMPORTED_MODULE_0__["CustomCoordinates"](-73.5633265, 45.5009128)
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "Bg0t":
/*!*****************************************************!*\
  !*** ./src/app/components/venue/venue.component.ts ***!
  \*****************************************************/
/*! exports provided: VenueComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VenueComponent", function() { return VenueComponent; });
/* harmony import */ var _environments_environment_dev__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../../../environments/environment.dev */ "LpW2");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var src_app_services_search_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/services/search.service */ "l3hs");
/* harmony import */ var src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/services/map/map.service */ "HYNq");
/* harmony import */ var _services_trip_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./../../services/trip.service */ "W524");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/card */ "PDjf");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/tooltip */ "ZFy/");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "G0yt");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");
/* harmony import */ var _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/grid-list */ "40+f");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/progress-spinner */ "pu8Q");
/* harmony import */ var _share_share_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../share/share.component */ "5ghV");
/* harmony import */ var _tabs_searchresults_add_to_trip_popover_add_to_trip_popover_component__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../tabs/searchresults/add-to-trip-popover/add-to-trip-popover.component */ "JVKH");
/* harmony import */ var _pipes_null_pipe__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../pipes/null.pipe */ "STwT");



















function VenueComponent_mat_card_0_button_3_Template(rf, ctx) { if (rf & 1) {
    const _r19 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "button", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function VenueComponent_mat_card_0_button_3_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r19); const ctx_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2); return ctx_r18.goBack(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "mat-icon", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2, " keyboard_backspace ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
function VenueComponent_mat_card_0_span_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "span", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "mat-icon", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2, "verified_user");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
function VenueComponent_mat_card_0_button_15_Template(rf, ctx) { if (rf & 1) {
    const _r21 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "button", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function VenueComponent_mat_card_0_button_15_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r21); const ctx_r20 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2); return ctx_r20.showOnMap(ctx_r20.content.location); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2, " map ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
function VenueComponent_mat_card_0_mat_icon_17_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "mat-icon", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "playlist_add");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2);
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngbPopover", _r3)("autoClose", "outside");
} }
function VenueComponent_mat_card_0_mat_spinner_18_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "mat-spinner", 43);
} }
function VenueComponent_mat_card_0_mat_icon_19_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "mat-icon", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "check");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
function VenueComponent_mat_card_0_mat_icon_20_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "mat-icon", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "error");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
const _c0 = function () { return ["prefix"]; };
const _c1 = function () { return ["suffix"]; };
function VenueComponent_mat_card_0_ngb_carousel_24_1_ng_template_0_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "img", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](2, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](3, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r26 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    const photo_r23 = ctx_r26.$implicit;
    const i_r24 = ctx_r26.index;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpropertyInterpolate2"]("src", "", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind2"](2, 3, photo_r23, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction0"](9, _c0)), "original", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind2"](3, 6, photo_r23, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction0"](10, _c1)), "", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpropertyInterpolate1"]("alt", "slide ", i_r24, "");
} }
function VenueComponent_mat_card_0_ngb_carousel_24_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](0, VenueComponent_mat_card_0_ngb_carousel_24_1_ng_template_0_Template, 4, 11, "ng-template", 46);
} }
function VenueComponent_mat_card_0_ngb_carousel_24_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "ngb-carousel");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, VenueComponent_mat_card_0_ngb_carousel_24_1_Template, 1, 0, undefined, 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx_r12.content.photos.groups[0].items);
} }
const _c2 = function () { return ["name"]; };
function VenueComponent_mat_card_0_span_34_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](2, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const category_r27 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind2"](2, 1, category_r27, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction0"](4, _c2)));
} }
const _c3 = function () { return ["summary"]; };
function VenueComponent_mat_card_0_div_37_span_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](2, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const attribute_r28 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" | ", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind2"](2, 1, attribute_r28, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction0"](4, _c3)), "");
} }
function VenueComponent_mat_card_0_div_37_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](3, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](4, VenueComponent_mat_card_0_div_37_span_4_Template, 3, 5, "span", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](5, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](6, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const attribute_r28 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"]("", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind2"](3, 2, attribute_r28, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction0"](11, _c2)), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind2"](5, 5, attribute_r28, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction0"](12, _c2)) !== _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind2"](6, 8, attribute_r28, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction0"](13, _c3)));
} }
function VenueComponent_mat_card_0_ng_template_47_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "span", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "span", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2, "\u2665");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3, "\u2665 ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const fill_r31 = ctx.fill;
    const ctx_r16 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵclassProp"]("full", fill_r31 === 100);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵstyleProp"]("width", fill_r31, "%")("color", ctx_r16.ratingColor);
} }
function VenueComponent_mat_card_0_div_55_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "b");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](7, "hr");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r32 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate2"]("", item_r32.user.firstName, " ", item_r32.user.lastName, ": ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](item_r32.text);
} }
const _c4 = function () { return ["page", "pageInfo", "description"]; };
function VenueComponent_mat_card_0_Template(rf, ctx) { if (rf & 1) {
    const _r34 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "mat-card", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "mat-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](3, VenueComponent_mat_card_0_button_3_Template, 3, 0, "button", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "button", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "span", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](7, "img", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](8, "span", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](10, VenueComponent_mat_card_0_span_10_Template, 3, 0, "span", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](11, "span", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](12, "button", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](13, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](14, " share ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](15, VenueComponent_mat_card_0_button_15_Template, 3, 0, "button", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](16, "button", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](17, VenueComponent_mat_card_0_mat_icon_17_Template, 2, 2, "mat-icon", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](18, VenueComponent_mat_card_0_mat_spinner_18_Template, 1, 0, "mat-spinner", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](19, VenueComponent_mat_card_0_mat_icon_19_Template, 2, 0, "mat-icon", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](20, VenueComponent_mat_card_0_mat_icon_20_Template, 2, 0, "mat-icon", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](21, "mat-card-content", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](22, "mat-grid-list", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](23, "mat-grid-tile", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](24, VenueComponent_mat_card_0_ngb_carousel_24_Template, 2, 1, "ngb-carousel", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](25, "mat-grid-tile", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](26, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](27, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](28, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](29);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](30, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](31, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](32, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](33, "category: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](34, VenueComponent_mat_card_0_span_34_Template, 3, 5, "span", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](35, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](36, "attributes:");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](37, VenueComponent_mat_card_0_div_37_Template, 7, 14, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](38, "mat-grid-tile", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](39, "div", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](40, "mat-label", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](41, "Rating: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](42, "b");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](43);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](44, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](45, " \u00A0 ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](46, "ngb-rating", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("rateChange", function VenueComponent_mat_card_0_Template_ngb_rating_rateChange_46_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r34); const ctx_r33 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r33.rating = $event; });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](47, VenueComponent_mat_card_0_ng_template_47_Template, 4, 6, "ng-template", null, 33, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](49, "mat-grid-tile", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](50, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](51, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](52, "h3", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](53, "b");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](54, "Reviews");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](55, VenueComponent_mat_card_0_div_55_Template, 8, 3, "div", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r0.openTab);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpropertyInterpolate"]("matTooltip", ctx_r0.content.categories[0].name);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpropertyInterpolate2"]("src", "", ctx_r0.content.categories[0].icon.prefix, "32", ctx_r0.content.categories[0].icon.suffix, "", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", ctx_r0.content.name, " \u00A0 ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r0.content.verified);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngbPopover", _r1)("autoClose", "outside");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r0.content.location ? true : false);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", !ctx_r0.isErr && !ctx_r0.isLoading && !ctx_r0.isSuccess);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r0.isLoading);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r0.isSuccess && !ctx_r0.isLoading);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r0.isErr && !ctx_r0.isLoading);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpropertyInterpolate"]("rowHeight", ctx_r0.windowHeight * 0.1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r0.content.photos);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"]("description: ", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind2"](30, 23, ctx_r0.content, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction0"](28, _c4)), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx_r0.content.categories);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx_r0.content.attributes.groups);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](44, 26, ctx_r0.rating));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("rate", ctx_r0.rating)("readonly", true)("max", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx_r0.content.tips.groups[0].items);
} }
function VenueComponent_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "app-share", 52);
} if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("UrlLink", ctx_r2.ogUrl);
} }
function VenueComponent_ng_template_3_Template(rf, ctx) { if (rf & 1) {
    const _r36 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "app-add-to-trip-popover", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("onSubmitEvent", function VenueComponent_ng_template_3_Template_app_add_to_trip_popover_onSubmitEvent_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r36); const ctx_r35 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r35.addToTrip($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
class VenueComponent {
    constructor(router, SearchService, MapService, TripService) {
        this.router = router;
        this.SearchService = SearchService;
        this.MapService = MapService;
        this.TripService = TripService;
        this.ogUrl = null;
        this.url = null;
        this.content = null;
        this.rating = null;
        this.ratingColor = null;
        this.displayContent = [];
        this.windowHeight = window.innerHeight;
        this.isLoading = false;
        this.isSuccess = false;
        this.isErr = false;
        this.trips = [];
    }
    ngOnInit() {
        this.trip_sub = this.TripService.trips.subscribe((trips) => {
            this.trips = trips;
        });
        this.openTabSub = this.SearchService.searchTab.subscribe(x => {
            this.openTab = x;
        });
        this.ogUrl = _environments_environment_dev__WEBPACK_IMPORTED_MODULE_0__["environment"].travelnetURL + this.router.url;
        this.url = this.router.url.replace('/search/venue/', '');
        this.SearchService.formatDetails(this.url).then(result => {
            console.log(result);
            this.content = result.response.venue;
            if (this.content.rating && this.content.ratingColor) {
                this.rating = this.content.rating;
                this.ratingColor = `#${this.content.ratingColor}`;
            }
        });
    }
    /** add venue to specific trips */
    addToTrip(event) {
        this.isLoading = true;
        if (event.length && this.trips) {
            event.map((option) => {
                this.trips[option.value.trip].schedule[option.value.day].venues.push({
                    name: this.content.name ? this.content.name : null,
                    venueAddress: this.content.location.formattedAddress ? this.content.location.formattedAddress.join(' ') : null,
                    venueCoord: this.content.location.lng ? { lng: this.content.location.lng, lat: this.content.location.lat } : null,
                    venueCity: this.content.location.city ? this.content.location.city : null,
                    url: this.content.canonicalUrl ? this.content.canonicalUrl : null,
                    category: this.content.categories[0] ? { name: this.content.categories[0].name, url: this.content.categories[0].icon.prefix + '32' + this.content.categories[0].icon.suffix } : null
                });
            });
            this.TripService.modifyBackend(this.trips)
                .then((val) => {
                this.isSuccess = true;
            })
                .catch(err => {
                this.isErr = true;
            })
                .finally(() => {
                setTimeout(() => {
                    this.isErr = false;
                }, 800);
                this.isLoading = false;
            });
        }
    }
    goBack() {
        this.router.navigate(['search'], { queryParams: this.SearchService.currentSearch ? this.SearchService.currentSearch : {} });
    }
    // check if is object
    isObject(val) {
        if (typeof (val) == 'object') {
            return true;
        }
        else {
            return false;
        }
    }
    // for ngIf, filter keys in user reviews
    reviewKeys(key) {
        const keys = ['likes', 'text', 'user'];
        if (keys.includes(key)) {
            return true;
        }
        else {
            return false;
        }
    }
    showOnMap(location) {
        this.MapService.addMarker(location);
    }
    ngOnDestroy() {
        this.openTabSub.unsubscribe();
        this.MapService.venueOnDestroy();
    }
}
VenueComponent.ɵfac = function VenueComponent_Factory(t) { return new (t || VenueComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](src_app_services_search_service__WEBPACK_IMPORTED_MODULE_3__["SearchService"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_4__["MapService"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_services_trip_service__WEBPACK_IMPORTED_MODULE_5__["TripService"])); };
VenueComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: VenueComponent, selectors: [["app-venue"]], decls: 5, vars: 1, consts: [["class", "container", 4, "ngIf"], ["sharePop", ""], ["popContent", ""], [1, "container"], [1, "row"], ["mat-button", "", "class", "col-auto", "matTooltip", "back", 3, "click", 4, "ngIf"], [1, "col-auto", "md-auto"], ["mat-flat-button", "", "color", "primary", "matTooltipPosition", "above", 1, "align-self-start", 3, "matTooltip"], [2, "padding", "auto", "display", "inline-block"], ["alt", "", 3, "src"], [1, "col-auto", "md-auto", "align-self-center"], ["matTooltip", "Verified Venue", "matTooltipPosition", "above", 4, "ngIf"], [1, "col", "justify-content-end"], ["mat-icon-button", "", "matTooltip", "share", "matTooltipPosition", "above", "color", "accent", "placement", "right", 3, "ngbPopover", "autoClose"], ["mat-icon-button", "", "matTooltip", "show on map", "matTooltipPosition", "above", "color", "primary", 3, "click", 4, "ngIf"], ["mat-icon-button", "", "matTooltip", "add to trip", "matTooltipPosition", "above"], ["mat-icon-button", "", "matTooltipPosition", "above", "matTooltip", "add to trip...", 3, "ngbPopover", "autoClose", 4, "ngIf"], ["diameter", "20", 4, "ngIf"], ["mat-icon-button", "", "class", "text-success", 4, "ngIf"], ["mat-icon-button", "", "class", "text-danger", "matTooltip", "an error occured", 4, "ngIf"], [1, ""], ["cols", "4", 3, "rowHeight"], ["id", "imgTile", "colspan", "2", "rowspan", "4"], [4, "ngIf"], ["colspan", "2", "rowspan", "3"], [1, "container-fluid"], [1, "div"], [4, "ngFor", "ngForOf"], ["class", "div", 4, "ngFor", "ngForOf"], ["colspan", "4", "rowspan", "1", 1, "border", "border-primary"], [1, "container", "row"], [1, "col-auto", "align-self-center"], [3, "rate", "readonly", "max", "rateChange"], ["t", ""], ["colspan", "4", "rowspan", "5"], [1, "align-self-start", "d-inline"], [2, "margin-bottom", "0"], ["class", "row d-inline", 4, "ngFor", "ngForOf"], ["mat-button", "", "matTooltip", "back", 1, "col-auto", 3, "click"], ["matTooltip", "Verified Venue", "matTooltipPosition", "above"], ["mat-icon-button", "", "color", "primary", 2, "vertical-align", "middle"], ["mat-icon-button", "", "matTooltip", "show on map", "matTooltipPosition", "above", "color", "primary", 3, "click"], ["mat-icon-button", "", "matTooltipPosition", "above", "matTooltip", "add to trip...", 3, "ngbPopover", "autoClose"], ["diameter", "20"], ["mat-icon-button", "", 1, "text-success"], ["mat-icon-button", "", "matTooltip", "an error occured", 1, "text-danger"], ["ngbSlide", ""], [1, "picsum-img-wrapper"], [1, "d-inline-flex", "w-100", 3, "src", "alt"], [1, "star"], [1, "half"], [1, "row", "d-inline"], [3, "UrlLink"], [3, "onSubmitEvent"]], template: function VenueComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](0, VenueComponent_mat_card_0_Template, 56, 29, "mat-card", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, VenueComponent_ng_template_1_Template, 1, 1, "ng-template", null, 1, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplateRefExtractor"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](3, VenueComponent_ng_template_3_Template, 1, 0, "ng-template", null, 2, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplateRefExtractor"]);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.content);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_6__["NgIf"], _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCard"], _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardTitle"], _angular_material_button__WEBPACK_IMPORTED_MODULE_8__["MatButton"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_9__["MatTooltip"], _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_10__["NgbPopover"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_11__["MatIcon"], _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardContent"], _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_12__["MatGridList"], _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_12__["MatGridTile"], _angular_common__WEBPACK_IMPORTED_MODULE_6__["NgForOf"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_13__["MatLabel"], _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_10__["NgbRating"], _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_14__["MatSpinner"], _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_10__["NgbCarousel"], _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_10__["NgbSlide"], _share_share_component__WEBPACK_IMPORTED_MODULE_15__["ShareComponent"], _tabs_searchresults_add_to_trip_popover_add_to_trip_popover_component__WEBPACK_IMPORTED_MODULE_16__["AddToTripPopoverComponent"]], pipes: [_pipes_null_pipe__WEBPACK_IMPORTED_MODULE_17__["NullPipe"]], styles: ["button[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n\n.star[_ngcontent-%COMP%] {\n  position: relative;\n  display: inline-block;\n  font-size: 3rem;\n  color: #e0dfdf;\n}\n\n.half[_ngcontent-%COMP%] {\n  position: absolute;\n  display: inline-block;\n  overflow: hidden;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFx2ZW51ZS5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGFBQUE7QUFDRjs7QUFFQTtFQUNFLGtCQUFBO0VBQ0EscUJBQUE7RUFDQSxlQUFBO0VBQ0EsY0FBQTtBQUNGOztBQUVBO0VBQ0Usa0JBQUE7RUFDQSxxQkFBQTtFQUNBLGdCQUFBO0FBQ0YiLCJmaWxlIjoidmVudWUuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyJidXR0b246Zm9jdXMge1xyXG4gIG91dGxpbmU6IG5vbmU7XHJcbn1cclxuXHJcbi5zdGFyIHtcclxuICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xyXG4gIGZvbnQtc2l6ZTogM3JlbTtcclxuICBjb2xvcjogI2UwZGZkZjtcclxufVxyXG5cclxuLmhhbGYge1xyXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XHJcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICAvLyBjb2xvcjogcmVkO1xyXG59Il19 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](VenueComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"],
        args: [{
                selector: 'app-venue',
                templateUrl: './venue.component.html',
                styleUrls: ['./venue.component.scss']
            }]
    }], function () { return [{ type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] }, { type: src_app_services_search_service__WEBPACK_IMPORTED_MODULE_3__["SearchService"] }, { type: src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_4__["MapService"] }, { type: _services_trip_service__WEBPACK_IMPORTED_MODULE_5__["TripService"] }]; }, null); })();


/***/ }),

/***/ "D4op":
/*!*********************************************************************!*\
  !*** ./src/app/components/display-posts/display-posts.component.ts ***!
  \*********************************************************************/
/*! exports provided: DisplayPostsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DisplayPostsComponent", function() { return DisplayPostsComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_add_post_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/add-post.service */ "woXb");
/* harmony import */ var src_app_services_http_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/services/http.service */ "N+K7");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var _search_posts_search_posts_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../search-posts/search-posts.component */ "3AFk");
/* harmony import */ var _add_tag_add_tag_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../add-tag/add-tag.component */ "4eJP");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/card */ "PDjf");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/tooltip */ "ZFy/");
/* harmony import */ var _comment_section_comment_section_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../comment-section/comment-section.component */ "hihI");












const _c0 = function (a1) { return ["/edit", a1]; };
function DisplayPostsComponent_div_3_div_1_a_9_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "a", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "EDIT");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const post_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLink", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction1"](1, _c0, post_r3._id));
} }
function DisplayPostsComponent_div_3_div_1_button_10_Template(rf, ctx) { if (rf & 1) {
    const _r9 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function DisplayPostsComponent_div_3_div_1_button_10_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r9); const post_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit; const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r7.onDelete(post_r3._id); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "DELETE");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function DisplayPostsComponent_div_3_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-card", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "mat-card-header");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](3, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "mat-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "mat-card-subtitle");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](7, "Premium User");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](9, DisplayPostsComponent_div_3_div_1_a_9_Template, 2, 3, "a", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](10, DisplayPostsComponent_div_3_div_1_button_10_Template, 2, 0, "button", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "h1");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](13, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](15, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](17, "img", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](18, "mat-card-actions");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](19, "button", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function DisplayPostsComponent_div_3_div_1_Template_button_click_19_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r11); const post_r3 = ctx.$implicit; const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r10.like(post_r3._id); })("mousedown", function DisplayPostsComponent_div_3_div_1_Template_button_mousedown_19_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r11); const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r12.mousedown(); })("mouseup", function DisplayPostsComponent_div_3_div_1_Template_button_mouseup_19_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r11); const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r13.mouseup(); })("mouseleave", function DisplayPostsComponent_div_3_div_1_Template_button_mouseleave_19_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r11); const ctx_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r14.mouseup(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](21, "button", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](22, "SHARE");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](23, "app-comment-section", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const post_r3 = ctx.$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](post_r3.author);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r2.ownContent(post_r3));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r2.ownContent(post_r3));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", post_r3.title, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate2"](" ", post_r3.tags, " ", post_r3.date, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", post_r3.content, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("src", post_r3.imagePath, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"])("alt", post_r3.title);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("matTooltip", post_r3.likes);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"]("LIKE ", post_r3.likes.length, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("post", post_r3);
} }
function DisplayPostsComponent_div_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, DisplayPostsComponent_div_3_div_1_Template, 24, 12, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx_r0.posts);
} }
function DisplayPostsComponent_p_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "No posts added yet!");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
class DisplayPostsComponent {
    constructor(postsService, HttpService, route) {
        this.postsService = postsService;
        this.HttpService = HttpService;
        this.route = route;
        // posts = [
        //   { title: "First Post", content: "This is the first post's content" },
        //   { title: "Second Post", content: "This is the second post's content" },
        //   { title: "Third Post", content: "This is the third post's content" }
        // ];
        this.posts = [];
        this.isLoading = false;
        this.likeShow = false;
    }
    ngOnInit() {
        if (sessionStorage.getItem('username')) {
            this.isLoading = true;
            this.route.params.subscribe(params => {
                this.input = params.query;
                if (this.input) {
                    this.postsService.searchPosts({ input: this.input });
                    this.postsSub = this.postsService.getPostUpdateListener()
                        .subscribe((posts) => {
                        this.isLoading = false;
                        this.posts = posts;
                    });
                }
                else {
                    this.HttpService.get('/user', null).then((res) => {
                        this.user = res.user[0];
                        this.postsService.getRelevantPosts({ author: this.user.username, follows: this.user.following, tags: this.user.tags, location: this.user.location });
                        this.postsSub = this.postsService.getPostUpdateListener()
                            .subscribe((posts) => {
                            this.isLoading = false;
                            this.posts = posts;
                        });
                    });
                }
            });
        }
    }
    onDelete(postId) {
        this.postsService.deletePost(postId);
    }
    ngOnDestroy() {
        if (sessionStorage.getItem('username')) {
            this.postsSub.unsubscribe();
        }
    }
    like(postId) {
        this.postsService.likePost(postId, sessionStorage.getItem('username'));
    }
    mouseup() {
        if (this.timeoutHandler) {
            clearInterval(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    }
    mousedown() {
        this.timeoutHandler = setInterval(() => {
            this.showLikes();
            console.log(this.likeShow);
        }, 300);
    }
    showLikes() {
        this.likeShow = !this.likeShow;
    }
    submitComment(comment) {
    }
    ownContent(post) {
        if (sessionStorage.getItem('username') === post.author) {
            return true;
        }
    }
}
DisplayPostsComponent.ɵfac = function DisplayPostsComponent_Factory(t) { return new (t || DisplayPostsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_add_post_service__WEBPACK_IMPORTED_MODULE_1__["AddPostService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_http_service__WEBPACK_IMPORTED_MODULE_2__["HttpService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"])); };
DisplayPostsComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: DisplayPostsComponent, selectors: [["app-display-posts"]], decls: 5, vars: 2, consts: [[1, "row", "container"], [1, "col-6"], [4, "ngIf"], ["class", "info-text mat-body-1", 4, "ngIf"], [4, "ngFor", "ngForOf"], [1, ""], ["mat-card-avatar", "", 1, ""], [1, "authorButtons"], ["mat-button", "", "color", "primary", 3, "routerLink", 4, "ngIf"], ["mat-button", "", "color", "warn", 3, "click", 4, "ngIf"], ["mat-card-image", "", 3, "src", "alt"], ["mat-button", "", "type", "button", 3, "matTooltip", "click", "mousedown", "mouseup", "mouseleave"], ["mat-button", ""], [3, "post"], ["mat-button", "", "color", "primary", 3, "routerLink"], ["mat-button", "", "color", "warn", 3, "click"], [1, "info-text", "mat-body-1"]], template: function DisplayPostsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "app-search-posts", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "app-add-tag", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](3, DisplayPostsComponent_div_3_Template, 2, 1, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](4, DisplayPostsComponent_p_4_Template, 2, 0, "p", 3);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.posts.length > 0 && !ctx.isLoading);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.posts.length <= 0 && !ctx.isLoading);
    } }, directives: [_search_posts_search_posts_component__WEBPACK_IMPORTED_MODULE_4__["SearchPostsComponent"], _add_tag_add_tag_component__WEBPACK_IMPORTED_MODULE_5__["AddTagComponent"], _angular_common__WEBPACK_IMPORTED_MODULE_6__["NgIf"], _angular_common__WEBPACK_IMPORTED_MODULE_6__["NgForOf"], _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCard"], _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardHeader"], _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardAvatar"], _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardTitle"], _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardSubtitle"], _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardImage"], _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardActions"], _angular_material_button__WEBPACK_IMPORTED_MODULE_8__["MatButton"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_9__["MatTooltip"], _comment_section_comment_section_component__WEBPACK_IMPORTED_MODULE_10__["CommentSectionComponent"], _angular_material_button__WEBPACK_IMPORTED_MODULE_8__["MatAnchor"], _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterLinkWithHref"]], styles: ["[_nghost-%COMP%] {\n  display: block;\n  margin-top: 1rem;\n}\n\nmat-spinner[_ngcontent-%COMP%] {\n  margin: auto;\n}\n\n.info-text[_ngcontent-%COMP%] {\n  text-align: center;\n}\n\n.post-image[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.post-image[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 100%;\n  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);\n}\n\n.authorButtons[_ngcontent-%COMP%] {\n  right: 0px;\n  position: absolute;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxkaXNwbGF5LXBvc3RzLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsY0FBQTtFQUNBLGdCQUFBO0FBQ0Y7O0FBRUE7RUFDRSxZQUFBO0FBQ0Y7O0FBRUE7RUFDRSxrQkFBQTtBQUNGOztBQUVBO0VBQ0UsV0FBQTtBQUNGOztBQUVBO0VBQ0UsV0FBQTtFQUNBLDBDQUFBO0FBQ0Y7O0FBQ0E7RUFDRSxVQUFBO0VBQ0Esa0JBQUE7QUFFRiIsImZpbGUiOiJkaXNwbGF5LXBvc3RzLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiOmhvc3Qge1xyXG4gIGRpc3BsYXk6IGJsb2NrO1xyXG4gIG1hcmdpbi10b3A6IDFyZW07XHJcbn1cclxuXHJcbm1hdC1zcGlubmVyIHtcclxuICBtYXJnaW46IGF1dG87XHJcbn1cclxuXHJcbi5pbmZvLXRleHQge1xyXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcclxufVxyXG5cclxuLnBvc3QtaW1hZ2Uge1xyXG4gIHdpZHRoOiAxMDAlO1xyXG59XHJcblxyXG4ucG9zdC1pbWFnZSBpbWcge1xyXG4gIHdpZHRoOiAxMDAlO1xyXG4gIGJveC1zaGFkb3c6IDFweCAxcHggNXB4IHJnYmEoMCwgMCwgMCwgMC41KTtcclxufVxyXG4uYXV0aG9yQnV0dG9ucyB7XHJcbiAgcmlnaHQ6IDBweDtcclxuICBwb3NpdGlvbjogYWJzb2x1dGVcclxufVxyXG4iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](DisplayPostsComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-display-posts',
                templateUrl: './display-posts.component.html',
                styleUrls: ['./display-posts.component.scss']
            }]
    }], function () { return [{ type: src_app_services_add_post_service__WEBPACK_IMPORTED_MODULE_1__["AddPostService"] }, { type: src_app_services_http_service__WEBPACK_IMPORTED_MODULE_2__["HttpService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"] }]; }, null); })();


/***/ }),

/***/ "DZ0t":
/*!*********************************************************!*\
  !*** ./src/app/components/profile/profile.component.ts ***!
  \*********************************************************/
/*! exports provided: ProfileComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ProfileComponent", function() { return ProfileComponent; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _mime_type_validator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mime-type.validator */ "2CGX");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/services/chatsystem/socket.service */ "QeH8");
/* harmony import */ var src_app_services_session_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/services/session.service */ "IfdK");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var src_app_services_http_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! src/app/services/http.service */ "N+K7");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _proprety_proprety_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./proprety/proprety.component */ "7A62");












function ProfileComponent_div_1_app_proprety_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](0, "app-proprety", 12);
} if (rf & 2) {
    const proprety_r6 = ctx.$implicit;
    const i_r7 = ctx.index;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("username", ctx_r1.User.username)("proprety", proprety_r6)("propretyValue", ctx_r1.values[i_r7]);
} }
function ProfileComponent_div_1_div_11_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](1, "img", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("src", ctx_r3.imagePreview, _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵsanitizeUrl"])("alt", ctx_r3.form.value.title);
} }
function ProfileComponent_div_1_button_12_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "button", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1, "Submit");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} }
function ProfileComponent_div_1_div_13_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1, " Error: User not found ");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} }
function ProfileComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r9 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](1, ProfileComponent_div_1_app_proprety_1_Template, 1, 3, "app-proprety", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](2, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](3, "button", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function ProfileComponent_div_1_Template_button_click_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r9); const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](); return ctx_r8.onDelete(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](4, "Delete Account");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](5, "form", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("submit", function ProfileComponent_div_1_Template_form_submit_5_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r9); const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](); return ctx_r10.onSubmit(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](6, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](7, "button", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function ProfileComponent_div_1_Template_button_click_7_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r9); const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵreference"](10); return _r2.click(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](8, "Change Profile Picture");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](9, "input", 7, 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("change", function ProfileComponent_div_1_Template_input_change_9_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r9); const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](); return ctx_r12.onImagePicked($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](11, ProfileComponent_div_1_div_11_Template, 2, 2, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](12, ProfileComponent_div_1_button_12_Template, 2, 0, "button", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](13, ProfileComponent_div_1_div_13_Template, 2, 0, "div", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](14, "button", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function ProfileComponent_div_1_Template_button_click_14_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r9); const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](); return ctx_r13.onExit(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](15, "Back");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx_r0.propreties);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("formGroup", ctx_r0.form);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx_r0.imagePreview !== "" && ctx_r0.imagePreview && ctx_r0.form.get("image").valid);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx_r0.form.valid);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", !ctx_r0.User);
} }
class ProfileComponent {
    constructor(socketService, sessionService, Router, httpService) {
        this.socketService = socketService;
        this.sessionService = sessionService;
        this.Router = Router;
        this.httpService = httpService;
    }
    ngOnInit() {
        // http request to get user info
        this.getProfile();
        this.form = new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroup"]({
            image: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](null, {
                validators: [_angular_forms__WEBPACK_IMPORTED_MODULE_0__["Validators"].required],
                asyncValidators: [_mime_type_validator__WEBPACK_IMPORTED_MODULE_1__["mimeType"]]
            })
        });
    }
    getProfile() {
        this.httpService.get('/user', null).then((res) => {
            this.User = (({ username, password, email, firstname, lastname, birthdate, gender }) => ({ username, password, email, firstname, lastname, birthdate, gender }))(res.user[0]);
            // transform object in arrays
            this.propreties = Object.keys(this.User);
            this.values = Object.values(this.User);
            // takeout username
            this.propreties.shift();
            this.values.shift();
        }).catch((err) => {
            console.log(err);
        });
    }
    // delete account function
    onDelete() {
        this.Router.navigate(['./']);
        this.socketService.emit('deleteUser', sessionStorage.getItem('username'), (data) => {
            if (data.err) {
                console.log(data.err);
            }
            else {
                console.log(data.res);
                localStorage.removeItem('username');
                sessionStorage.removeItem('username');
                this.sessionService.session();
                window.location.reload();
                console.log('session cleared');
            }
        });
    }
    // when profile pic is selected
    onImagePicked(event) {
        const file = event.target.files[0];
        this.form.patchValue({ image: file });
        this.form.get('image').updateValueAndValidity();
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview = reader.result;
        };
        reader.readAsDataURL(file);
    }
    // on image picked
    onSubmit() {
        if (this.form.invalid) {
            return;
        }
        const formData = new FormData();
        formData.append('image', this.form.value.image);
        formData.append('username', localStorage.getItem('username'));
        this.httpService.post('/user/profilepicture', formData).then((res) => {
        }).catch((err) => {
            console.log(err);
        });
        this.form.reset();
    }
    // back button that destroys component
    onExit() {
        this.ngOnDestroy();
    }
    ngOnDestroy() {
        this.Router.navigate(['./']);
    }
}
ProfileComponent.ɵfac = function ProfileComponent_Factory(t) { return new (t || ProfileComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](src_app_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_3__["SocketService"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](src_app_services_session_service__WEBPACK_IMPORTED_MODULE_4__["SessionService"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](src_app_services_http_service__WEBPACK_IMPORTED_MODULE_6__["HttpService"])); };
ProfileComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({ type: ProfileComponent, selectors: [["app-profile"]], decls: 2, vars: 1, consts: [["id", "main", 1, "container-fluid", "rounded"], [4, "ngIf"], [3, "username", "proprety", "propretyValue", 4, "ngFor", "ngForOf"], ["id", "delete"], [1, "btn", "btn-danger", 3, "click"], [3, "formGroup", "submit"], ["type", "button", 1, "btn", "btn-danger", 3, "click"], ["type", "file", 1, "hidden", 3, "change"], ["filePicker", ""], ["class", "image-preview", 4, "ngIf"], ["class", "btn btn-danger", "color", "accent", "type", "submit", 4, "ngIf"], [1, "btn", "btn-secondary", 3, "click"], [3, "username", "proprety", "propretyValue"], [1, "image-preview"], [3, "src", "alt"], ["color", "accent", "type", "submit", 1, "btn", "btn-danger"]], template: function ProfileComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](1, ProfileComponent_div_1_Template, 16, 5, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.User);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_7__["NgIf"], _angular_common__WEBPACK_IMPORTED_MODULE_7__["NgForOf"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroupDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_8__["ɵa"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_8__["ɵi"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_8__["ɵj"], _proprety_proprety_component__WEBPACK_IMPORTED_MODULE_9__["PropretyComponent"]], styles: ["#main[_ngcontent-%COMP%] {\n  z-index: 2;\n  background-color: rgba(255, 255, 255, 0.9);\n  padding-left: 1%;\n  padding-right: 1%;\n}\n\n.btn[_ngcontent-%COMP%] {\n  margin: 1%;\n}\n\n.hidden[_ngcontent-%COMP%] {\n  visibility: hidden;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxwcm9maWxlLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBRUksVUFBQTtFQUVBLDBDQUFBO0VBQ0EsZ0JBQUE7RUFDQSxpQkFBQTtBQURKOztBQU9BO0VBQ0ksVUFBQTtBQUpKOztBQU9BO0VBQ0ksa0JBQUE7QUFKSiIsImZpbGUiOiJwcm9maWxlLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiI21haW4ge1xyXG4gICAgLy8gcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgei1pbmRleDogMjtcclxuICAgIC8vIHRvcDogMnB4O1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsMjU1LDI1NSwgJGFscGhhOiAwLjkpO1xyXG4gICAgcGFkZGluZy1sZWZ0OiAxJTtcclxuICAgIHBhZGRpbmctcmlnaHQ6IDElO1xyXG4gICAgLy8gdG9wOiAyMCU7XHJcbiAgICAvLyBsZWZ0OiAyNSU7XHJcbiAgICAvLyByaWdodDogMjUlO1xyXG59XHJcblxyXG4uYnRuIHtcclxuICAgIG1hcmdpbjogMSU7XHJcbn1cclxuXHJcbi5oaWRkZW4ge1xyXG4gICAgdmlzaWJpbGl0eTogaGlkZGVuO1xyXG59XHJcbiJdfQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵsetClassMetadata"](ProfileComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_2__["Component"],
        args: [{
                selector: 'app-profile',
                templateUrl: './profile.component.html',
                styleUrls: ['./profile.component.scss']
            }]
    }], function () { return [{ type: src_app_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_3__["SocketService"] }, { type: src_app_services_session_service__WEBPACK_IMPORTED_MODULE_4__["SessionService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"] }, { type: src_app_services_http_service__WEBPACK_IMPORTED_MODULE_6__["HttpService"] }]; }, null); })();


/***/ }),

/***/ "EZtS":
/*!*************************************************!*\
  !*** ./src/app/components/map/map.component.ts ***!
  \*************************************************/
/*! exports provided: MapComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MapComponent", function() { return MapComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_session_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/session.service */ "IfdK");
/* harmony import */ var src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/services/map/map.service */ "HYNq");




class MapComponent {
    constructor(sessionService, map) {
        this.sessionService = sessionService;
        this.map = map;
        this.session = this.sessionService.session();
    }
    ngOnInit() {
        this.map.buildMap();
    }
}
MapComponent.ɵfac = function MapComponent_Factory(t) { return new (t || MapComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_session_service__WEBPACK_IMPORTED_MODULE_1__["SessionService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_2__["MapService"])); };
MapComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: MapComponent, selectors: [["app-map"]], decls: 2, vars: 0, consts: [["href", "https://api.mapbox.com/mapbox-gl-js/v1.8.1/mapbox-gl.css", "rel", "stylesheet"], ["id", "mapbox"]], template: function MapComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "link", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "div", 1);
    } }, styles: ["#mapbox[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxtYXAuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxXQUFBO0VBQ0EsWUFBQTtBQUNKIiwiZmlsZSI6Im1hcC5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIiNtYXBib3gge1xyXG4gICAgd2lkdGg6IDEwMCU7XHJcbiAgICBoZWlnaHQ6IDEwMCU7XHJcbn1cclxuIl19 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](MapComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-map',
                templateUrl: './map.component.html',
                styleUrls: ['./map.component.scss']
            }]
    }], function () { return [{ type: src_app_services_session_service__WEBPACK_IMPORTED_MODULE_1__["SessionService"] }, { type: src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_2__["MapService"] }]; }, null); })();


/***/ }),

/***/ "Edcf":
/*!*********************************************!*\
  !*** ./src/app/pipes/array-to-pipe.pipe.ts ***!
  \*********************************************/
/*! exports provided: ArrayToPipePipe */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ArrayToPipePipe", function() { return ArrayToPipePipe; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");


class ArrayToPipePipe {
    transform(value, ...args) {
        return Array(value).fill(args[0]);
    }
}
ArrayToPipePipe.ɵfac = function ArrayToPipePipe_Factory(t) { return new (t || ArrayToPipePipe)(); };
ArrayToPipePipe.ɵpipe = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefinePipe"]({ name: "arrayToPipe", type: ArrayToPipePipe, pure: true });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ArrayToPipePipe, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Pipe"],
        args: [{
                name: 'arrayToPipe'
            }]
    }], null, null); })();


/***/ }),

/***/ "FvPJ":
/*!***************************************!*\
  !*** ./src/app/models/coordinates.ts ***!
  \***************************************/
/*! exports provided: CustomCoordinates */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CustomCoordinates", function() { return CustomCoordinates; });
class CustomCoordinates {
    constructor(lng, lat) {
        this.lng = lng;
        this.lat = lat;
    }
    /** 1: lng,lat | 2: lat,lng */
    toStringReorder(order) {
        if (order === 1) {
            return `${this.lng},${this.lat}`;
        }
        else {
            return `${this.lat},${this.lng}`;
        }
    }
}


/***/ }),

/***/ "HSUS":
/*!*****************************************************************************************!*\
  !*** ./src/app/components/tabs/mytrip/add-venue-popover/add-venue-popover.component.ts ***!
  \*****************************************************************************************/
/*! exports provided: AddVenuePopoverComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AddVenuePopoverComponent", function() { return AddVenuePopoverComponent; });
/* harmony import */ var _search_bar_search_bar_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../../../search-bar/search-bar.component */ "lCy9");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/material/dialog */ "iELJ");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _services_search_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./../../../../services/search.service */ "l3hs");
/* harmony import */ var _services_trip_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./../../../../services/trip.service */ "W524");
/* harmony import */ var _services_map_map_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./../../../../services/map/map.service */ "HYNq");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/card */ "PDjf");
/* harmony import */ var _angular_material_tabs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/tabs */ "M9ds");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/input */ "e6WT");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/select */ "ZTz/");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/core */ "UhP/");
/* harmony import */ var _city_search_city_search_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../../city-search/city-search.component */ "tuAr");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/tooltip */ "ZFy/");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/progress-spinner */ "pu8Q");
























const _c0 = ["citySearch"];
function AddVenuePopoverComponent_mat_tab_7_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "label", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "Search");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function AddVenuePopoverComponent_mat_tab_7_Template(rf, ctx) { if (rf & 1) {
    const _r10 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "mat-tab", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "form", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("ngSubmit", function AddVenuePopoverComponent_mat_tab_7_Template_form_ngSubmit_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r10); const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r9.onSubmitSearch(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, AddVenuePopoverComponent_mat_tab_7_ng_template_2_Template, 2, 0, "ng-template", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](3, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](4, "app-search-bar", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("submission", function AddVenuePopoverComponent_mat_tab_7_Template_app_search_bar_submission_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r10); const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r11.onSubmitSearch(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function AddVenuePopoverComponent_ng_template_11_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "label", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "Custom");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2, " \u00A0 ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "mat-icon", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](4, "info");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function AddVenuePopoverComponent_small_17_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "small", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "Name must be between 1 and 20 characters");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function AddVenuePopoverComponent_mat_option_25_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "mat-option", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const category_r12 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("value", category_r12.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](category_r12.name);
} }
function AddVenuePopoverComponent_mat_spinner_47_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](0, "mat-spinner", 29);
} }
function AddVenuePopoverComponent_small_50_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "small", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "New Venue added Succesfully!");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
class AddVenuePopoverComponent {
    constructor(SearchService, TripService, MapService, dialogRef, data) {
        this.SearchService = SearchService;
        this.TripService = TripService;
        this.MapService = MapService;
        this.dialogRef = dialogRef;
        this.data = data;
        // user data from tripService
        this.allTrips = [];
        this.defaultCategory = 'All';
        this.venueCategories = [];
        this.citySearchAppearance = 'outline';
        this.citySearchPlaceholder = 'Search for a City';
        // for component visual
        this.isLoading = false;
        this.isErr = false;
        this.tripIndex = data.tripIndex;
        this.dayIndex = data.scheduleIndex;
        this.venueIndex = data.venueIndex;
    }
    ngOnInit() {
        this.isLoaded = false;
        // sets mat select venue category options
        this.foursquareCategory_sub = this.SearchService.categoryTree.subscribe((cats) => {
            this.venueCategories = cats;
        });
        // gets user trips from trip service
        this.trips_sub = this.TripService.trips.subscribe((trips) => {
            this.allTrips = trips;
        });
        // get map center from map service
        this.mapCenter_sub = this.MapService.fakeCenter.subscribe((coord) => {
            this.searchUrlCoord = coord;
        });
        this.searchVenueForm = new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormGroup"]({
            name: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].minLength(1), _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].maxLength(25)])
        });
        this.customVenueForm = new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormGroup"]({
            name: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].minLength(1), _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].maxLength(25)]),
            address: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null),
            price: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null),
            url: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null)
        });
        // fill form if user is editing venue
        if (this.venueIndex != null) {
            this.customVenueForm.get('name').patchValue(this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].name ? this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].name : '');
            this.customVenueForm.get('address').patchValue(this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].venueAddress ? this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].venueAddress : '');
            this.customVenueForm.get('price').patchValue(this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].price ? this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].price : 0);
            this.customVenueForm.get('url').patchValue(this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].url ? this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].url : '');
        }
    }
    ngAfterViewInit() {
        // selected option from autosuggest
        this.selectedOption_sub = this.CitySearchComponent.clickedOption.subscribe((location) => {
            if (location) {
                this.selectedOption = location;
                this.CitySearchComponent.myControl.patchValue(location.name);
            }
        });
        // fill form if user is editing venue
        if (this.venueIndex != null) {
            this.CitySearchComponent.myControl.patchValue(this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].venueCity ? this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].venueCity : '');
        }
    }
    /** when user searches venues from foursquare */
    onSubmitSearch() {
        this.isLoading = true;
        if (this.SearchBarComponent.searchBarForm.valid) {
            this.isLoading = false;
            this.dialogRef.close();
        }
        this.isLoading = false;
    }
    /** update when user adds custom venue */
    onSubmitCustom() {
        if (this.customVenueForm.valid) {
            let url = null;
            for (const category of this.venueCategories) {
                if (category.name === this.defaultCategory) {
                    url = category.icon.prefix + '32' + category.icon.suffix;
                    break;
                }
            }
            // if edit venue
            if (this.venueIndex != null) {
                this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex] = {
                    name: this.customVenueForm.get('name').value,
                    venueCity: this.CitySearchComponent.myControl.value ? this.CitySearchComponent.removeMiddle(this.CitySearchComponent.myControl.value, 0) : '',
                    venueCoord: { lng: this.selectedOption.content.geometry.coordinates[0], lat: this.selectedOption.content.geometry.coordinates[1] },
                    venueAddress: this.customVenueForm.get('address').value ? this.customVenueForm.get('address').value : '',
                    price: this.customVenueForm.get('price').value ? this.customVenueForm.get('price').value : 0,
                    category: url ? { name: this.defaultCategory, url } : null,
                    url: this.customVenueForm.get('url').value ? this.customVenueForm.get('url').value : ''
                };
            }
            else {
                // if add venue
                this.allTrips[this.tripIndex].schedule[this.dayIndex].venues.push({
                    name: this.customVenueForm.get('name').value,
                    venueCity: this.CitySearchComponent.myControl.value ? this.CitySearchComponent.removeMiddle(this.CitySearchComponent.myControl.value, 0) : '',
                    venueCoord: { lng: this.selectedOption.content.geometry.coordinates[0], lat: this.selectedOption.content.geometry.coordinates[1] },
                    venueAddress: this.customVenueForm.get('address').value ? this.customVenueForm.get('address').value : '',
                    price: this.customVenueForm.get('price').value ? this.customVenueForm.get('price').value : 0,
                    category: url ? { name: this.defaultCategory, url } : null,
                    url: this.customVenueForm.get('url').value ? this.customVenueForm.get('url').value : ''
                });
            }
            this.TripService.modifyBackend(this.allTrips)
                .then((response) => {
                this.TripService.updateLocal(this.allTrips);
                setTimeout(() => {
                    this.dialogRef.close();
                }, 500);
            })
                .catch((err) => {
                this.isErr = true;
            })
                .finally(() => {
                this.isLoading = false;
                this.isLoaded = true;
            });
        }
    }
    ngOnDestroy() {
        this.selectedOption_sub.unsubscribe();
        this.trips_sub.unsubscribe();
        this.foursquareCategory_sub.unsubscribe();
        this.mapCenter_sub.unsubscribe();
    }
}
AddVenuePopoverComponent.ɵfac = function AddVenuePopoverComponent_Factory(t) { return new (t || AddVenuePopoverComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_search_service__WEBPACK_IMPORTED_MODULE_4__["SearchService"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_trip_service__WEBPACK_IMPORTED_MODULE_5__["TripService"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_map_map_service__WEBPACK_IMPORTED_MODULE_6__["MapService"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MatDialogRef"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MAT_DIALOG_DATA"])); };
AddVenuePopoverComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({ type: AddVenuePopoverComponent, selectors: [["app-add-venue-popover"]], viewQuery: function AddVenuePopoverComponent_Query(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵviewQuery"](_search_bar_search_bar_component__WEBPACK_IMPORTED_MODULE_0__["SearchBarComponent"], true);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵviewQuery"](_c0, true);
    } if (rf & 2) {
        var _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵloadQuery"]()) && (ctx.SearchBarComponent = _t.first);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵloadQuery"]()) && (ctx.CitySearchComponent = _t.first);
    } }, decls: 52, vars: 12, consts: [["dynamicHeight", "", "mat-align-tabs", "center"], ["id", "theTab", 4, "ngIf"], [3, "formGroup", "ngSubmit"], ["customForm", ""], ["mat-tab-label", ""], ["appearance", "outline"], ["matInput", "", "type", "text", "autocomplete", "off", "formControlName", "name"], ["class", "text-danger", 4, "ngIf"], [3, "value", "valueChange"], ["value", "All"], [3, "value", 4, "ngFor", "ngForOf"], [2, "margin-top", "0"], [3, "appearance", "placeholder"], ["citySearch", ""], ["matInput", "", "type", "text", "autocomplete", "street-address", "formControlName", "address"], ["matInput", "", "type", "number", "formControlName", "price"], ["matInput", "", "type", "url", "formControlName", "url"], [1, "row", "container-fluid"], ["mat-raised-button", "", "matTooltip", "add custom Venue", "color", "primary", 1, "col-auto", 3, "disabled"], ["class", "col-auto align-self-center", "diameter", "30", "color", "primary", 4, "ngIf"], ["class", "text-success", 4, "ngIf"], ["id", "theTab"], [1, "container-fluid", 2, "padding", "0", 3, "ngSubmit"], ["isChild", "true", 2, "padding", "0", "margin-left", "0", "margin-right", "0", "width", "100%", 3, "submission"], ["matTooltip", "Search Venue in Database", 2, "margin", "0"], [2, "margin", "0"], ["matTooltip", "Add Custom Venue"], [1, "text-danger"], [3, "value"], ["diameter", "30", "color", "primary", 1, "col-auto", "align-self-center"], [1, "text-success"]], template: function AddVenuePopoverComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "mat-card");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "mat-card-header");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "mat-card-title");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](4, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "mat-card-content");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](6, "mat-tab-group", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](7, AddVenuePopoverComponent_mat_tab_7_Template, 5, 0, "mat-tab", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](8, "mat-tab");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](9, "form", 2, 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("ngSubmit", function AddVenuePopoverComponent_Template_form_ngSubmit_9_listener() { return ctx.onSubmitCustom(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](11, AddVenuePopoverComponent_ng_template_11_Template, 5, 0, "ng-template", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](12, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](13, "mat-form-field", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](14, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](15, "Venue Name*");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](16, "input", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](17, AddVenuePopoverComponent_small_17_Template, 2, 0, "small", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](18, " \u00A0 ");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](19, "mat-form-field", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](20, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](21, "Category");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](22, "mat-select", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("valueChange", function AddVenuePopoverComponent_Template_mat_select_valueChange_22_listener($event) { return ctx.defaultCategory = $event; });
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](23, "mat-option", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](24, "All");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](25, AddVenuePopoverComponent_mat_option_25_Template, 2, 2, "mat-option", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](26, "hr", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](27, "app-city-search", 12, 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](29, "mat-form-field", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](30, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](31, "Street Address");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](32, "input", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](33, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](34, "mat-form-field", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](35, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](36, "Price");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](37, "input", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](38, " \u00A0 ");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](39, "mat-form-field", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](40, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](41, "Website Url");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](42, "input", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](43, "span", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](44, "button", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](45, " Add ");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](46, " \u00A0 ");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](47, AddVenuePopoverComponent_mat_spinner_47_Template, 1, 0, "mat-spinner", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](48, " \u00A0 ");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](49, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](50, AddVenuePopoverComponent_small_50_Template, 2, 0, "small", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](51, "mat-card-actions");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate2"]("", ctx.venueIndex != null ? "Edit" : "Add", " Venue for Day ", ctx.dayIndex + 1, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.venueIndex === null);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("formGroup", ctx.customVenueForm);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](8);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", !ctx.customVenueForm.get("name").valid && ctx.customVenueForm.get("name").touched);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("value", ctx.defaultCategory);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx.venueCategories);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("appearance", ctx.citySearchAppearance)("placeholder", ctx.citySearchPlaceholder);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](17);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("disabled", ctx.isLoading);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.isLoading);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.isLoaded && !ctx.isErr);
    } }, directives: [_angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCard"], _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardHeader"], _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardTitle"], _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardContent"], _angular_material_tabs__WEBPACK_IMPORTED_MODULE_8__["MatTabGroup"], _angular_common__WEBPACK_IMPORTED_MODULE_9__["NgIf"], _angular_material_tabs__WEBPACK_IMPORTED_MODULE_8__["MatTab"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormGroupDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_10__["ɵa"], _angular_material_tabs__WEBPACK_IMPORTED_MODULE_8__["MatTabLabel"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_11__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_11__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_12__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControlName"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_10__["ɵk"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_10__["ɵe"], _angular_material_select__WEBPACK_IMPORTED_MODULE_13__["MatSelect"], _angular_material_core__WEBPACK_IMPORTED_MODULE_14__["MatOption"], _angular_common__WEBPACK_IMPORTED_MODULE_9__["NgForOf"], _city_search_city_search_component__WEBPACK_IMPORTED_MODULE_15__["CitySearchComponent"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NumberValueAccessor"], _angular_material_button__WEBPACK_IMPORTED_MODULE_16__["MatButton"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_17__["MatTooltip"], _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardActions"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NgForm"], _search_bar_search_bar_component__WEBPACK_IMPORTED_MODULE_0__["SearchBarComponent"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_18__["MatIcon"], _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_19__["MatSpinner"]], styles: ["button[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n\n  .mat-tab-body-content {\n  padding: 0;\n}\n\n  app-city-search {\n  padding-left: 0;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFwuLlxcLi5cXGFkZC12ZW51ZS1wb3BvdmVyLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0ksYUFBQTtBQUNKOztBQUVBO0VBQ0ksVUFBQTtBQUNKOztBQUVBO0VBQ0ksZUFBQTtBQUNKIiwiZmlsZSI6ImFkZC12ZW51ZS1wb3BvdmVyLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiYnV0dG9uOmZvY3VzIHtcclxuICAgIG91dGxpbmU6IG5vbmU7XHJcbn1cclxuXHJcbjo6bmctZGVlcCAubWF0LXRhYi1ib2R5LWNvbnRlbnQge1xyXG4gICAgcGFkZGluZzogMDtcclxufVxyXG5cclxuOjpuZy1kZWVwIGFwcC1jaXR5LXNlYXJjaCB7XHJcbiAgICBwYWRkaW5nLWxlZnQ6IDA7XHJcbn0iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵsetClassMetadata"](AddVenuePopoverComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_3__["Component"],
        args: [{
                selector: 'app-add-venue-popover',
                templateUrl: './add-venue-popover.component.html',
                styleUrls: ['./add-venue-popover.component.scss']
            }]
    }], function () { return [{ type: _services_search_service__WEBPACK_IMPORTED_MODULE_4__["SearchService"] }, { type: _services_trip_service__WEBPACK_IMPORTED_MODULE_5__["TripService"] }, { type: _services_map_map_service__WEBPACK_IMPORTED_MODULE_6__["MapService"] }, { type: _angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MatDialogRef"] }, { type: undefined, decorators: [{
                type: _angular_core__WEBPACK_IMPORTED_MODULE_3__["Inject"],
                args: [_angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MAT_DIALOG_DATA"]]
            }] }]; }, { SearchBarComponent: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_3__["ViewChild"],
            args: [_search_bar_search_bar_component__WEBPACK_IMPORTED_MODULE_0__["SearchBarComponent"]]
        }], CitySearchComponent: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_3__["ViewChild"],
            args: ['citySearch']
        }] }); })();


/***/ }),

/***/ "HYNq":
/*!*********************************************!*\
  !*** ./src/app/services/map/map.service.ts ***!
  \*********************************************/
/*! exports provided: featureGEOJSONModel, MapService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "featureGEOJSONModel", function() { return featureGEOJSONModel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MapService", function() { return MapService; });
/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mapbox-gl */ "4ZJM");
/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mapbox_gl__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _models_coordinates__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./../../models/coordinates */ "FvPJ");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/environments/environment */ "AytR");
/* harmony import */ var src_app_services_session_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! src/app/services/session.service */ "IfdK");
/* harmony import */ var _openstreetmap_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./openstreetmap.service */ "9W9C");








class featureGEOJSONModel {
    constructor(title, coordinates) {
        this.type = 'Feature';
        this.geometry = {
            type: 'Point',
            coordinates
        };
        this.properties = {
            title,
            'marker-color': '#3c4e5a',
            'marker-symbol': 'marker-15',
            'marker-size': 'large',
        };
    }
}
class MapService {
    constructor(SessionService, OpenstreetmapService) {
        this.SessionService = SessionService;
        this.OpenstreetmapService = OpenstreetmapService;
        this.citySearchPresent = null;
        this._fakeCenter = new rxjs__WEBPACK_IMPORTED_MODULE_2__["BehaviorSubject"](null);
        this.fakeCenter = this._fakeCenter.asObservable();
        this._fakeCenterCity = new rxjs__WEBPACK_IMPORTED_MODULE_2__["BehaviorSubject"]({});
        this.fakeCenterCity = this._fakeCenterCity.asObservable();
        this._clickLocation = new rxjs__WEBPACK_IMPORTED_MODULE_2__["BehaviorSubject"]({
            lat: null,
            lng: null
        });
        this.clickLocation = this._clickLocation.asObservable();
        this.Places = [[], []];
        mapbox_gl__WEBPACK_IMPORTED_MODULE_0__["accessToken"] = src_environments_environment__WEBPACK_IMPORTED_MODULE_4__["environment"].mapbox.token;
        this.sidebarWidth_sub = this.SessionService.sidebarWidth.subscribe((w) => {
            this.sidebarWidth = w;
        });
    }
    buildMap() {
        this.map = new mapbox_gl__WEBPACK_IMPORTED_MODULE_0__["Map"]({
            container: 'mapbox',
            style: 'mapbox://styles/travelnet/ck99afyp80hhu1iqrodjf1brl',
            center: [-71.22, 46.85],
            zoom: 2,
            failIfMajorPerformanceCaveat: true,
            // if the performance of Mapbox GL JS
            pitchWithRotate: false,
            dragRotate: false,
        });
        // this._clickLocation = new BehaviorSubject(`${this.map.getCenter().lng},${this.map.getCenter().lat}`)
        // this.clickLocation = this._clickLocation.asObservable()
        this.map.on('load', () => {
            // init center observable
            this.getCenter();
            this.getFakeCenter();
            this.map.on('click', (e) => {
                const lng = e.lngLat.lng;
                const lat = e.lngLat.lat;
                this._clickLocation.next({
                    lng,
                    lat
                });
            });
        });
        // update fake center of map
        this.map
            .on('zoomend', () => {
            this.getFakeCenter();
        })
            .on('moveend', () => {
            this.getFakeCenter();
        });
    }
    addGeoJsonSource(id, type, content) {
        this.map.addSource(id, {
            type: 'geojson',
            data: {
                type,
                features: content
            }
        });
    }
    addLayer(id, type, source, layout, paint) {
        this.map.addLayer({
            id,
            type,
            source,
            layout,
            paint
        });
    }
    addMarker(location) {
        const coord = {
            lng: location.lng,
            lat: location.lat
        };
        this.venueLocation = new mapbox_gl__WEBPACK_IMPORTED_MODULE_0__["Marker"]()
            .setLngLat(coord)
            .addTo(this.map);
        coord.lng -= this.lngOffset;
        this.map.flyTo({ center: coord, speed: 0.8, curve: 1, essential: true });
    }
    /** gets middle point between sidebar and right side of screen */
    getFakeCenter(sidebar = this.sidebarWidth) {
        let centerPoints;
        if (sidebar < 500) {
            centerPoints = this.map.unproject([window.innerWidth / 2, window.innerHeight / 2]);
        }
        else {
            centerPoints = this.map.unproject([(window.innerWidth - sidebar) / 2 + sidebar, window.innerHeight / 2]);
        }
        const realCenter = this.map.getCenter();
        centerPoints = new _models_coordinates__WEBPACK_IMPORTED_MODULE_1__["CustomCoordinates"](centerPoints.lng, centerPoints.lat);
        this.lngOffset = centerPoints.lng - realCenter.lng;
        // update coord at fake center
        this._fakeCenter.next(centerPoints);
        if (this.citySearchPresent) {
            // get name of city at fake center
            this.OpenstreetmapService.reverseSearch(centerPoints.lng, centerPoints.lat)
                .subscribe((response) => {
                this._fakeCenterCity.next(response);
            }, err => {
                console.log(err);
                this._fakeCenterCity.next(err);
            });
        }
    }
    /** return coordinates [lng, lat] at center of screen if not found -> montreal*/
    getCenter() {
        const lng = this.map.getCenter().lng ? this.map.getCenter().lng : src_environments_environment__WEBPACK_IMPORTED_MODULE_4__["environment"].montrealCoord.lng;
        const lat = this.map.getCenter().lat ? this.map.getCenter().lat : src_environments_environment__WEBPACK_IMPORTED_MODULE_4__["environment"].montrealCoord.lat;
        return new _models_coordinates__WEBPACK_IMPORTED_MODULE_1__["CustomCoordinates"](lng, lat);
    }
    /** highlight selected coutries when register */
    showMarker(target, input, style) {
        if (!input && this.map.getSource('points') && this.Places[target - 1]) {
            this.map.getSource('points').setData({
                type: 'FeatureCollection',
                features: this.Places[target - 1]
            });
        }
        else if (input) {
            this.Places[target - 1].push(new featureGEOJSONModel(input.name, input.content.geometry.coordinates));
            const coord = {
                lng: input.content.geometry.coordinates[0],
                lat: input.content.geometry.coordinates[1]
            };
            coord.lng -= this.lngOffset;
            this.map.flyTo({ center: coord, speed: 0.8, curve: 1, essential: true });
            if (this.map.getSource('points')) {
                // update points
                this.map.getSource('points').setData({
                    type: 'FeatureCollection',
                    features: this.Places[target - 1]
                });
            }
            else {
                // add first point
                this.map.addSource('points', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [
                            {
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [
                                        input.content.geometry.coordinates[0],
                                        input.content.geometry.coordinates[1],
                                    ]
                                },
                                properties: {
                                    title: input.name,
                                    'marker-color': '#3c4e5a',
                                    'marker-symbol': 'marker-15',
                                    'marker-size': 'large',
                                }
                            },
                        ]
                    }
                });
            }
        }
        if (!this.map.getLayer('points') && this.map.getSource('points')) {
            this.map.addLayer({
                id: 'points',
                type: 'symbol',
                source: 'points',
                layout: {
                    // get the icon name from the source's "icon" property
                    // concatenate the name to get an icon from the style's sprite sheet
                    'icon-image': ['get', 'marker-symbol'],
                    // get the title name from the source's "title" property
                    'text-field': ['get', 'title'],
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-offset': [0, 0.6],
                    'text-anchor': 'top'
                }
            });
        }
    }
    // remove markers on map
    removeMarker(name, target, all) {
        if (all) {
            this.Places[target - 1] = [];
            if (this.map.getSource('points')) {
                this.map.getSource('points').setData({
                    type: 'FeatureCollection',
                    features: []
                });
            }
        }
        else {
            for (let x = 0; x < this.Places[target - 1].length; x++) {
                if (this.Places[target - 1][x].properties.title == name) {
                    this.Places[target - 1].splice(x, 1);
                    this.map.getSource('points').setData({
                        type: 'FeatureCollection',
                        features: this.Places[target - 1]
                    });
                    break;
                }
            }
        }
    }
    venueOnDestroy() {
        if (this.venueLocation) {
            this.venueLocation.remove();
        }
    }
    ngOnDestroy() {
        this.sidebarWidth_sub.unsubscribe();
    }
}
MapService.ɵfac = function MapService_Factory(t) { return new (t || MapService)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](src_app_services_session_service__WEBPACK_IMPORTED_MODULE_5__["SessionService"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_openstreetmap_service__WEBPACK_IMPORTED_MODULE_6__["OpenstreetmapService"])); };
MapService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineInjectable"]({ token: MapService, factory: MapService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵsetClassMetadata"](MapService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_3__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: src_app_services_session_service__WEBPACK_IMPORTED_MODULE_5__["SessionService"] }, { type: _openstreetmap_service__WEBPACK_IMPORTED_MODULE_6__["OpenstreetmapService"] }]; }, null); })();


/***/ }),

/***/ "IfdK":
/*!*********************************************!*\
  !*** ./src/app/services/session.service.ts ***!
  \*********************************************/
/*! exports provided: SessionService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SessionService", function() { return SessionService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./chatsystem/socket.service */ "QeH8");




class SessionService {
    constructor(SocketService) {
        this.SocketService = SocketService;
        // observable for login state
        this._sessionState = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"](false);
        this.sessionState = this._sessionState.asObservable();
        this._sidebarWidth = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"](window.innerWidth * .4);
        this.sidebarWidth = this._sidebarWidth.asObservable();
    }
    getRoomName(roomName) {
        if (roomName.replace(`${sessionStorage.getItem('username')},`, '').includes(roomName)) {
            return roomName.replace(`,${sessionStorage.getItem('username')}`, '');
        }
        else {
            return roomName.replace(`${sessionStorage.getItem('username')},`, '');
        }
    }
    session() {
        if (sessionStorage.getItem('username')) {
            this._sessionState.next(true);
            return true;
        }
        else {
            this._sessionState.next(false);
            return false;
        }
    }
    updateSidebarWidth(width) {
        this._sidebarWidth.next(width);
    }
}
SessionService.ɵfac = function SessionService_Factory(t) { return new (t || SessionService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_2__["SocketService"])); };
SessionService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: SessionService, factory: SessionService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](SessionService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_2__["SocketService"] }]; }, null); })();


/***/ }),

/***/ "JVKH":
/*!****************************************************************************************************!*\
  !*** ./src/app/components/tabs/searchresults/add-to-trip-popover/add-to-trip-popover.component.ts ***!
  \****************************************************************************************************/
/*! exports provided: AddToTripPopoverComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AddToTripPopoverComponent", function() { return AddToTripPopoverComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/material/list */ "SqCe");
/* harmony import */ var _services_trip_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./../../../../services/trip.service */ "W524");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/expansion */ "o4Yh");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/table */ "OaSA");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/tooltip */ "ZFy/");











function AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_header_cell_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-header-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, " Category ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_cell_9_button_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "img", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r16 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("matTooltip", element_r16.category.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("src", element_r16.category.url, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
} }
function AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_cell_9_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_cell_9_button_1_Template, 2, 2, "button", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r16 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", element_r16.category);
} }
function AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_header_cell_11_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-header-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, " Name ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_cell_12_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r19 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", element_r19.name, " ");
} }
function AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_header_cell_14_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-header-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, " price ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_cell_15_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r20 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", element_r20.price, " ");
} }
function AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_header_row_16_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "mat-header-row");
} }
function AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_row_17_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "mat-row");
} }
const _c0 = function (a0, a1) { return { trip: a0, day: a1 }; };
const _c1 = function () { return ["category", "name", "price"]; };
function AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_Template(rf, ctx) { if (rf & 1) {
    const _r23 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-expansion-panel", null, 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "mat-expansion-panel-header");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "mat-list-option", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_Template_mat_list_option_click_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r23); const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵreference"](1); return _r7.toggle(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](5, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "mat-table", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](7, 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](8, AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_header_cell_8_Template, 2, 0, "mat-header-cell", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](9, AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_cell_9_Template, 2, 1, "mat-cell", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](10, 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](11, AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_header_cell_11_Template, 2, 0, "mat-header-cell", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](12, AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_cell_12_Template, 2, 1, "mat-cell", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](13, 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](14, AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_header_cell_14_Template, 2, 0, "mat-header-cell", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](15, AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_cell_15_Template, 2, 1, "mat-cell", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](16, AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_header_row_16_Template, 1, 0, "mat-header-row", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](17, AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_mat_row_17_Template, 1, 0, "mat-row", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const day_r5 = ctx.$implicit;
    const j_r6 = ctx.index;
    const ctx_r24 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    const i_r2 = ctx_r24.index;
    const trip_r1 = ctx_r24.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("value", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction2"](7, _c0, i_r2, j_r6));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](5, 5, day_r5.day), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("dataSource", trip_r1.schedule[j_r6].venues);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("matHeaderRowDef", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](10, _c1));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("matRowDefColumns", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](11, _c1));
} }
function AddToTripPopoverComponent_mat_expansion_panel_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-expansion-panel");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-expansion-panel-header");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "mat-panel-description");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](6, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](7, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "mat-selection-list", null, 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "mat-accordion");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](11, AddToTripPopoverComponent_mat_expansion_panel_4_mat_expansion_panel_11_Template, 18, 12, "mat-expansion-panel", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const trip_r1 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", trip_r1.tripName, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate2"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](6, 4, trip_r1.dateRange.start), " \u2014 ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](7, 6, trip_r1.dateRange.end), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", trip_r1.schedule);
} }
class AddToTripPopoverComponent {
    constructor(TripService) {
        this.TripService = TripService;
        this.onSubmitEvent = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.trips = null;
    }
    ngOnInit() {
        this.trip_sub = this.TripService.trips.subscribe((trips) => {
            this.trips = trips;
        });
    }
    ngAfterViewInit() {
    }
    onSubmit() {
        this.onSubmitEvent.emit(this.MatSelectionList.selectedOptions.selected);
    }
    ngOnDestroy() {
        this.trip_sub.unsubscribe();
    }
}
AddToTripPopoverComponent.ɵfac = function AddToTripPopoverComponent_Factory(t) { return new (t || AddToTripPopoverComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_trip_service__WEBPACK_IMPORTED_MODULE_2__["TripService"])); };
AddToTripPopoverComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: AddToTripPopoverComponent, selectors: [["app-add-to-trip-popover"]], viewQuery: function AddToTripPopoverComponent_Query(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵviewQuery"](_angular_material_list__WEBPACK_IMPORTED_MODULE_1__["MatSelectionList"], true);
    } if (rf & 2) {
        var _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵloadQuery"]()) && (ctx.MatSelectionList = _t.first);
    } }, outputs: { onSubmitEvent: "onSubmitEvent" }, decls: 9, vars: 1, consts: [[4, "ngFor", "ngForOf"], [1, "container-fluid", "justify-content-end"], ["mat-raised-button", "", "color", "primary", 3, "click"], ["days", ""], ["panel", ""], [2, "margin-right", "1em", 3, "value", "click"], [1, "mat-elevation-z8", 3, "dataSource"], ["matColumnDef", "category"], [4, "matHeaderCellDef"], [4, "matCellDef"], ["matColumnDef", "name"], ["matColumnDef", "price"], [4, "matHeaderRowDef"], [4, "matRowDef", "matRowDefColumns"], ["mat-mini-fab", "", "color", "primary", "style", "box-shadow: none;", 3, "matTooltip", 4, "ngIf"], ["mat-mini-fab", "", "color", "primary", 2, "box-shadow", "none", 3, "matTooltip"], ["alt", "", 2, "margin-top", "-0.3em", 3, "src"]], template: function AddToTripPopoverComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "h2");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, "Select Where You Want To Add This Venue");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "mat-accordion");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](4, AddToTripPopoverComponent_mat_expansion_panel_4_Template, 12, 8, "mat-expansion-panel", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](5, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "span", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "button", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function AddToTripPopoverComponent_Template_button_click_7_listener() { return ctx.onSubmit(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](8, " add ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.trips);
    } }, directives: [_angular_material_form_field__WEBPACK_IMPORTED_MODULE_3__["MatLabel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_4__["MatAccordion"], _angular_common__WEBPACK_IMPORTED_MODULE_5__["NgForOf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_6__["MatButton"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_4__["MatExpansionPanel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_4__["MatExpansionPanelHeader"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_4__["MatExpansionPanelTitle"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_4__["MatExpansionPanelDescription"], _angular_material_list__WEBPACK_IMPORTED_MODULE_1__["MatSelectionList"], _angular_material_list__WEBPACK_IMPORTED_MODULE_1__["MatListOption"], _angular_material_table__WEBPACK_IMPORTED_MODULE_7__["MatTable"], _angular_material_table__WEBPACK_IMPORTED_MODULE_7__["MatColumnDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_7__["MatHeaderCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_7__["MatCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_7__["MatHeaderRowDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_7__["MatRowDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_7__["MatHeaderCell"], _angular_material_table__WEBPACK_IMPORTED_MODULE_7__["MatCell"], _angular_common__WEBPACK_IMPORTED_MODULE_5__["NgIf"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_8__["MatTooltip"], _angular_material_table__WEBPACK_IMPORTED_MODULE_7__["MatHeaderRow"], _angular_material_table__WEBPACK_IMPORTED_MODULE_7__["MatRow"]], pipes: [_angular_common__WEBPACK_IMPORTED_MODULE_5__["DatePipe"]], styles: ["button[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFwuLlxcLi5cXGFkZC10by10cmlwLXBvcG92ZXIuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxhQUFBO0FBQ0oiLCJmaWxlIjoiYWRkLXRvLXRyaXAtcG9wb3Zlci5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbImJ1dHRvbjpmb2N1cyB7XHJcbiAgICBvdXRsaW5lOiBub25lO1xyXG59Il19 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AddToTripPopoverComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-add-to-trip-popover',
                templateUrl: './add-to-trip-popover.component.html',
                styleUrls: ['./add-to-trip-popover.component.scss']
            }]
    }], function () { return [{ type: _services_trip_service__WEBPACK_IMPORTED_MODULE_2__["TripService"] }]; }, { MatSelectionList: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"],
            args: [_angular_material_list__WEBPACK_IMPORTED_MODULE_1__["MatSelectionList"]]
        }], onSubmitEvent: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"]
        }] }); })();


/***/ }),

/***/ "LdkP":
/*!**********************************************************************************!*\
  !*** ./src/app/components/tabs/searchresults/userbutton/userbutton.component.ts ***!
  \**********************************************************************************/
/*! exports provided: UserbuttonComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UserbuttonComponent", function() { return UserbuttonComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_search_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/search.service */ "l3hs");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var src_app_services_http_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/services/http.service */ "N+K7");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/card */ "PDjf");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _pipes_null_pipe__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../pipes/null.pipe */ "STwT");









function UserbuttonComponent_mat_card_0_div_14_Template(rf, ctx) { if (rf & 1) {
    const _r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "button", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function UserbuttonComponent_mat_card_0_div_14_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r4); const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r3.onFollow(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, " Follow ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function UserbuttonComponent_mat_card_0_div_15_Template(rf, ctx) { if (rf & 1) {
    const _r6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "button", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function UserbuttonComponent_mat_card_0_div_15_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r6); const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r5.onUnfollow(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, " Unfollow ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
const _c0 = function () { return ["username"]; };
function UserbuttonComponent_mat_card_0_Template(rf, ctx) { if (rf & 1) {
    const _r8 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-card");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-card-header", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function UserbuttonComponent_mat_card_0_Template_mat_card_header_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r8); const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r7.navigate(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "img", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "mat-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](5, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "mat-card-subtitle");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](7, "User");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "mat-card-content", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function UserbuttonComponent_mat_card_0_Template_mat_card_content_click_8_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r8); const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r9.navigate(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](9, " lol ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](10, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](11, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "mat-card-actions", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](13, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](14, UserbuttonComponent_mat_card_0_div_14_Template, 3, 0, "div", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](15, UserbuttonComponent_mat_card_0_div_15_Template, 3, 0, "div", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind2"](5, 3, ctx_r0.searchResult, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](6, _c0)));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", !ctx_r0.result.followers.includes(ctx_r0.selfUsername));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r0.result.followers.includes(ctx_r0.selfUsername));
} }
class UserbuttonComponent {
    constructor(searchservice, router, HttpService) {
        this.searchservice = searchservice;
        this.router = router;
        this.HttpService = HttpService;
        this.selfUsername = localStorage.getItem('username');
    }
    ngOnInit() {
        console.log(this.result);
        this.searchResult = this.result;
        this.pathID = '/search/user/' + this.result.username;
    }
    navigate() {
        console.log(this.result);
        this.router.navigate([this.pathID]);
    }
    // follow button
    onFollow() {
        // update database
        this.HttpService.post('/user/follow', {
            username: localStorage.getItem('username'),
            followed: this.result.username
        }).then((res) => {
            // add the follower in current content
            this.result.followers.push(localStorage.getItem('username'));
        }).catch((err) => {
            console.log(err);
        });
    }
    // unfollow button
    onUnfollow() {
        // update database
        this.HttpService.post('/user/unfollow', {
            username: localStorage.getItem('username'),
            unfollowed: this.result.username
        }).then((res) => {
            // remove the follower from current content
            this.result.followers.splice(this.result.followers.indexOf(localStorage.getItem('username')), 1);
        }).catch((err) => {
            console.log(err);
        });
    }
}
UserbuttonComponent.ɵfac = function UserbuttonComponent_Factory(t) { return new (t || UserbuttonComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_search_service__WEBPACK_IMPORTED_MODULE_1__["SearchService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_http_service__WEBPACK_IMPORTED_MODULE_3__["HttpService"])); };
UserbuttonComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: UserbuttonComponent, selectors: [["app-userbutton"]], inputs: { result: "result" }, decls: 1, vars: 1, consts: [[4, "ngIf"], [1, "mainCard", 3, "click"], ["mat-card-avatar", "", "src", "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUQEhMVFRUVFRUXGBUVFRcVFRcVFRUWFhUVFxUYHiggGBolGxUVITEhJSorLi4uFx8zODMtNygtLisBCgoKDg0OFRAQFysdFR0rLSsrLS0rKy0rLSstLTctLSstKy0tLS0rKzEtLS03Ky0tLTctKystLSsrKy0rLSsrK//AABEIARAAuQMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAAAAQMEBQYHAgj/xABFEAABAwIDBAYGBggGAgMAAAABAAIDBBEFEiEGMUFREyJhcYGRBzJCUqGxFCNicsHRFRZTkpOi4fAkM0NUgrJjczTS4v/EABoBAQEBAQEBAQAAAAAAAAAAAAABAgMEBQb/xAAkEQEBAAICAgICAgMAAAAAAAAAAQIRAxIhMQRBMlETIgVSYf/aAAwDAQACEQMRAD8A7ehIhApSJUiBUJEqAQhIgVIhKgAhIhAqEiECoQkugVCRCBUISIFQhIgVIlQgRCEIFSIQgEICEAke4AEncBfyXpVO01TkgcOLhbwGpQN02PsLrOsAdx/NXLTfUblyAVfG60Gz+0bmEMJu3kfwPAqbXTfoUODFInkBrt/wPI8ipiqFSJUIESpEIBKkSoEQhKgRCEIBLdIhAIQhAIQhAJUiVALD7Y1+Z5YDo0ZfH2vyWyrKgRsdIdzQSuQ4vW5nHrC5JJ1QRzGTuBtzsmDcL1Tzlp0eO4nRT2lr+V1NN7OYdjJaQH303OG8fmF0rA8UbOwaguHLiOa5VNRclJwiplgeHMO47uHah7dfQq/BsVZUMzN0cPWbxB/JWCrAQhCBUFCCgEJEIFSJUIEQlQgEJmSpY05S4A8rp5AiVCEAgIQgiYjQNmaGPJyXuQNM1twJ5LxTYRTxizIY29zB8Ta5UbHMcbCMrQHScG3sB2uP4b1hMX2gqL9aoc3sZZgHl+abWR0afDYXiz4o3d7Gn8Fn8V2LoXC9jAeBY62vY03B7lX7MUFdKWzGpmZDvGeznSdzXXyt7StrDSMaS613He46u8zu7gqjBt2PqmuyskjkjO50mZjx3tsbp87Ez/tox4O/JbtzgBcmw58PNUddtbRxHKZQ53KMF/xGiiqak2Xq4nB7Jorjj1x4bty11G6TL9YGh3HKbtPaOKzo24gPqsee+w+Cei2vicfUd5goarSIUairmSi7D3jiFIRCoQhAIshCAQhCAQhCChbEXuYDfMTdzgRYa3I+SvgslhNRJGbljuAIIy/u81rGm4usYW/aQqEIW1C8yOsCeQuvSi4pJlhkdyafjogyOETxSSyNlYHdXNrwFzfvKqNlNmPpVRJVStd9GZIehY8ayWPtA+wPjZPvw5jsuXM2ZxDA5riN548wugRRtijDRZrWN3k2AA4k/ipG8vBySRrGlziGtaLkkgNAHM7gsHjnpHaCWUbRJb/Vd/l/8GjV3ebDvWM9IG1f02Ysjl/wkZAA9Vsjx6zzfVzb7uGl1R09azcLuPJjS8/yhVJi0NdilRUG88rnj3QcrB/xGi8MFtLJmmbUOHUo53drgIx/MpToa4D/AOJG3707b/AKWtzENKeheVVVMtYzfSsP3ZwfwTDcclb69LKO0EEKGm+2fxMxvBO7ce0LojTcXC4ZR7SRk6skb3tv8l13ZbEWz0zHtOa3VJ7W/wBhVnJbpEqRVgqEIQCEIQCS6j4lU9FE+S18rSbdy5/+tlX+zd5f0QdGjcHC4sQvapqGriiiuHFwFrnj32KuGm4B5rOOW0KhCQrSlVLtfWthpXvdqLsFhvJLhoFdKh25pDLRTAes0Z297Df5XQc8wOqxaomZUQwQxQNcdZjdxuLEhrTvsVabQ1FfO11PNPGyN4s4QMIcWne0vcdL9gV3gdB0UEMMVyCxrib8xckr1XuhYdS15G+x3FYtdpGJw/ZmlZa0DXW3GS7z5HT4LSUkwYMrQ1nY0AfJRqrGWbgwA8xdU7643LiVi11mLUueTxuostIXKnjx/LvITh2oYOOvY0u+SFj1VU7m723C8vDTE5thqOWu5Mx7Si+57u9jh8wnMQqWvaHMjcPeHZ3KssrNBkNiuo+i+P8Aw0juDpjbwa0Fc8xyIsYyQggXO8EWvuXR/Rgb0ZP/AJX/ACaF0jlm15SJUKuYQi6EAhCEEHGY80LmlwaDlzOJsAzMM+v3bqs/WXDP9zT/AL7VZ47h4qKeanOnSRvZ5iw+Nlzz9UJf9lD/ACINFsxhELrvYXvZpcvdfM5puNNy0VXiDWOEY1cdwsbd5svNHPE2HNGLMY09W1iLDUEb7rJDHLS5yHNc73txHAblw30nhm3TWYfXGRz26HJoSAbX5X4qwVZgnqk5A25voLX5lWZXXG7kWBR6+oZHG+SQgMa0lxOoDba6KQoGP0vS000XvxvHiWm3xWmo57jW1EP0UQxdOGNDY3TMDWXyjRoc88lh21cBvZ1U/sdKwA95aCVJxSmfG+MuY0sdG1zPaYcwuSBuvw8FDqYyQLWHdZc5dvVcJJ4IcVtcMiaO1z5Xn/sB8EfpCYAG0Yv9i/8A2JUKeLLqtHRsliy5BlJYM1wNxG6zh/d1MrIuGO/aqOIVB9sAfZjjHyamX4lOTrPIB99wHkFcYjQno2zNFmlxY+3CQC+7gCCD4FVBpCNUmUXLD9G4qiQn/MlI1/1X2+as8PnySwylz+pLG43e43DXgkG513KHTwknddWYww5cx3E/JW5eUmPjy222O1kU9NLBGC94ka02HUAzA3Ltyr8G2mkoYY4GtbKxty5wBboSXHW+p15Kpw2MNhliAHWbcd41Vfh1VIWugkAOUEg2APjZXs5dI7rSVAkY2Ru5zQ4dxF06q/Z2ItpYWneI2/JWC24UqEIQCEIKCtxLFOjzNYx0jg25AsANLjM46C/isF+v1X/tm/xR+StNoNk31NW98tQ9sDshETHFuYhjWuzHwSfqDQ+5J/Fk/wDsvPlzatj14YcfWbWeEY2Gt+sFr66G+v4qpxRsRkM8ZABtmbrf7wHAdyk4Jsk3I4Tyl5duF/V7bqxw7ZCCN2bM57u0/BSY31t4dbWGzof0ZLhYE3bffaytVEnqCHNjYLkm55Bg3lS16JNRuBI5Kq3GauWMNMbWm5sS4kActeW9BmMb2fjZAI33c2PNkPEMJu0f8bkeAXOaqIZiGBxHBdRxfH80d4ywTRnrAEPAFte8Xtv5rGVW1lbewlaPuxsH4Ljf+PVxZ2xWU2BSSWORwbcXcW6W5C+89i12GUhklkmncGk2DWHSzWgBo8gFmXVFdKx8oe57gNCT8GhU9P8ApE3c5mbtJyO/qs6rp2jbVuFOvKGsc+GUAEMILmOabskaCdeII4gqnZgzCLfSYhbeHZ2OHe0tVJNhNbIcxkfH9lj2208Fa0GEkgmqAe42tqSQBxJ0Tqd06nwmBu+qb/wY5x8CbJvaCpjsyOHNlbvJsCSe5R3NEWg3cFXVE2YqyGWR6nmOV44kWCtdn8KM1Qy4uX+sR6rYwbu73HQeKp6Vps7KLkAkDmbaarq2yOBup2l8hHSPA0bq1rd9gTv7+5dJNvPlk0LRbRKhC6OIQhM1M4Y0uO4KW6Dj5AN5A4a80ksgaLk2CymKYk8u1acvYb2tr5pMRxmRzGRQtzyP014Ae07sC81+R71Ge8XklXHJJka4FwF7cbL30YWFdOYJMrJnskBHSXDXi+/qjgLb1o/1li/bD+GfzXDtMvOXtrHm8aZ/CpHtBMjiDaw1Lteak4e2oe4dETe+ridLdqKfA6ioN3ENYTv3WHdxK2mG0DIWBjBu3niTzK9GGFvmpidpoyAMxzOtqbWv/RPJEL06UJuoha9pY4AtcLEHcQU4hQYTEMFho+q2FoZKcvT3Jcwu3Nee02sdywddCQ8jcQbHzXc54GvaWPAc1wIIOoIPArmO2eD/AEeUOFyyQaE8HDe0lY66b47qqL9Llg6NhDdNXWuR3DiUzGYiesah1yNXTBp/dAsAquWmaXdYuDb3OU2KsGOwtg+sZGT9ouue+6unU8RSt1DHD7RqHA/kVXT7QMj0ZI82PqvOfwBsCFOjxvDGf5ccbe3IXJl2LRk/VjxIt5BTRdPUdf0rcxFj2pm6JpQdQmQ9NJtZYeQM/wB1dsw5+aKN3NjD/KFwmnlsHHsC63FizoW00AjvnhZ1r7jYAC3ErWLnm0aE3DewzWvbW25RK6vET2h2519bX1Vt0wkVlRkbmsT3LJ1WJmSYxEP77dQW1I/qpuJY203aXAN8iViMWxZr29HDnDQb3BJuePcvLy5XK6npzyyPVdRNK42kEWRxDWu1bJyF+BSyV9b0UrpC2na1u58dy87rNcN25Q8AyOmY9sbnOYbySuk6ke/c21r9hU6ucGslE9R08L9XdG8CRpvcdUaOHcuOpHNQYUZ52O6GlEu/NM4erpwcSNVB/R0n7N/8RajBZJIYAKYTdG/M5oewZnDiQ3eQq/8ASx/27/4L/wAlrtodnY0AWGgXpCF73oIlSJUAhCEAq/HcLbUwuidpfVruLXDcVYIKDg+0WFyU7+jeMrtdeDm8HNPJVDMPjdq75arsvpGw7paQvAu6Ih/bl3OHxv4Li8z7EhF3U2Ohgb2nt0TFUxo9UfFROmK8FxTweU2GS4TrxYZjoOZ3JqhebhjIzJI42a0C5PcPxXTdltgAC2orrSSDVsI1ijO/X3z8FNLtQ7E7KPqiJZGllPfjo6UDg0cG8zx4c1utr6hkH0ectByTAW3HLkcSB5BaMNtoOHyXM/SpiwMkdO0+oM7vvO0A8vmrpm10OirmTMEsbszSN/4HkVmtr6l7wGxX6puSAfhzWKwLF5INGnqu9ZvPtHarCWoqr5+mD4yeodzh9kjgVy5d2ajOV8HpMPFT1zIC5ltSLW03EBQJMDYwOkLpJsouWxdUb7WtvKky1n0dsrXkZ3EEAG3DXU6lV2FVrz0ksgJiYA8BpAOYHq34kdi8XXJykWroYGRs3MaBn+jgEZ3EadIT+Kp6yiJtnZAxkhv1ZNAeF7Ly2pilLjnfLNI4HKN3YGt7kV2GwxkSVrw02s2FhzVBA3DKNGeKsxv23MLTste7p2NJkfazAWbmgbsjR26q/wDpdd+0l/g//lZiKsqXDLSwGmi5tBdM8fakPqjuSfo2q/8AL+8/8116x0/hrtyRMGT6wNtvaSDfkRcEeIT69gEqLoQCEIQCEIQM1kAkjfGfaa5vmLLieMQZJHQysyvF9CLeIPELuSrMcwOCqZkmYDbc4aPb2tdwRY+f6iAAr1Q0z5pGwQszyONgBwHFzjwC31V6NusbVYydrLyDs0NitHstQ0tIDHHG5pO+aS2Z57SNw5BZaPbGbJx0TMxs+dw68lt32WcmrUheWBeytM1GxKsbDE+Z/qsaXHw4Lg9bVPnldM/1nuLj+A8BouheljECI4qcHSRxc7tDLWHmfgudMC1IzUiOSwCs6CU2I4FUr3gC5NlMw+pa4Zm7vyTSL2laAbuax/323PmvDNm2ySXM+Rjt4Dbm3IW0UdsxUiGpI4rncJUjS0OCQRNIhuL73g2e4ci4C4HdZS6TDqaPVsLM3vEZj4udcqgp64jcbKfBiZ9qx+a4ZcN9x6+PPFbOlto0Af8AEJvppPfH7oUdmIxHecvyUrpGe+3zXmuOUezG8diZHiLnP6SwsBlDeIvqSSO5MjHbyENkiJG+PML+fNYajiLKOrLHauAN2k31JuL/AN71lYKbL1nttxDgddV3ne/b5+8f0667aMGXIJog4f6eYajjc8+5NzbTtdII+lawjlq0nkXLkVfYZd5IOlgT8UrZ7Pa8tMgHsntTWX+yd8Z9OtS7ZQOcYema13vNuQewEix8E2zbaMXa47vbsdfBYqjwOabrZGxN9kSC9u7TRTYdliAGSSsa5x0LXnMexrdyxvLftj+Sfpo8N21DnvYb2AJDnbzbebDcFYxYw4fWZiQeB3eA4LLUOAQUzzK9xebWDCb3PNx3W7k5VVpeb+Q4Ady9GOF/ZM1/SYvLJVwtJs12fqjdZrDqeetlqzrosNs6L1zR+zpy497yAFraKcl8jTwII7iFv1F9pIYOAC8SxNsbgW7k8oVXKSNENoVJiAjl6E6ttcH3ew9iuyqmmpAAXHeVnts9pH0sPQsB6SUODXcGNGjnd+ui3IlZPb3FBUVjspu2IdGDzcCS8+engqBqaaE6ujKJLRukd1yMg3NF9e9WcAyiyjOkygnkvVPKSLnipRZscnmvUFj04JFkWUcqcdVKq6VNS1CgsJ8Qso/6SH9hVr7nivPRqdY12re4PTQyRyxRtax8jdRc2dbXdw71R1uHxxExSmSF3248zSObXt0ISU07o3Ne02LSD+fwW9xanFZSPgLiOkZoRv4HT++K8m5H2f8AJfDnHnLj+Nc0w6vomZ8r5G23vMWZunHXcFocHxBjm54I3VAvo9sFrcxeypMDqThpeHxCSNwMby4Zi03+XYtFszUCkpsjZOkbI4vjDdGtBOoAXTHCZPk5Y6SHdJKeu2aLmZGtDfDXVNWhicZGDNJa3SO9a3Jo9kJitxFzzmc4nxVVJU3NlvHhmLnpLmqbnMf78EkcmZQXdZwdwG4cO9OCay6Jpr9hwHGqqebxGPusaNPNy0MDfrM9rXFlUbA09qJrjvkfI/zdYfAK8J4pY1tJlOigg6nRTo3XAKZlbxSTyPUDdFyf0jVWetczhE1rPE9Z3z+C6zCbC5/sLhWLVXTTyze/I4juvp8AFv7RGYE5ZeWhK91hdXaIle65EY46nuClMFlApOu50h4nTuCmucolPNcvWdRc69Z1FPvkTD5V4e9eFUes5RmK8kpMyLtq8QpnRaPGh9r2fPgtbhch6KAg7i3yIyn5rLQYxI0WktI07w4C/h/VWUUYi6KSElrHvZeMm7RmPs+6e7RfIytsfqvmd8sZM4r9tB0VWTYFkrRmbwuNLqujlY3SNuVo3Dlff8VY+kaQ9PH/AOvTzWXE5Xu4POMr85yeLpbT1V0xHJqoPTKRAV6HFOzpqaXQ9ybc9MSv0Kg61sO7/AU/3D8yrF+mirNitKGn/wDXfzJKs5Tqgfgd1UONym2HRe2FJBXbU1vQUk0nHLYd7uqPmucbG4LFMHSzDM1pytZcgX4uNt60XpTrLQxQj235j91g/MrFYJjz6UOb0YkY45rZspDrWPguXyJn1/r7dOPW/K022wWKAxSQdVshLXMuTYgXzNvrbfp3LJ1zyQGD2j8Fa4nislVI18gDGsBDGA3tfe5x4nQJdnMCkrZiGENZGOtI7VoJ3NHN3YtcEy6/29pya34VsTMoskJWvn2AqwbMdE9vvZiPMEKhx7AaijLemaMr/Ve05mE8r8D2Fd3LSuuvLnJCmnv1UodBXrNZRzIlBUDjnLxqlBS3UG5qsCJbmp5BI0+ySLjud+asMQYWsp2cRJECO24ustG5zHZonFrieBsDfmFcxtn+kwMmOly4W1BytJ3r5Ge3635GGWPjLLaP6SzaWA/YePIhZDpFpfSTNeaJvusJ/eP9FkMy+h8b8I/Nc35VNjepkblWROUhsi9GnFMdImZXaHuTJeklf1T3IjtezbctJTjlDH8WgqY/VMYbpDEOUbB/IE6SppTgK9ByZzJQ5WG3M/SRW56vJfSNjW+J6x+YWUa9P41V9LUSye9I8juzWHwCiNVE/DqV08rKdhsZDa/ui1yfIFddw6hipYmwRDK1vm48XOPElc12CbesDvcY8/C34rocjyVvET+lHNRqqJlRG+KYB0RGt+B4OB4Ec1WVuJQwi80zGfedr4NGpWZxL0hRDqwRukA3F3UZfnzPktXSMpiMAilkizZsji2/MX0PkqqWbUp6qrHSPdK+2Z7i4hugF+AVe513LnROh5lOXUUSr1nWDSTdF00x693QaN53Ab7j5hbp7vrYwbaNce3db8VhIDeSMc3t/wCwW1JvOT7oA7OJK+PzebH6r5+XpgNt6nNVv+yGt+F/xVFdaXAqBtdiEsj23iY8lzfesbBp7NFN9IOzdPBGKmA9H1mtMXsm/FnunmF9Xhx1hH5rkv8AasjE5eYprvPYmY3b03SO1JXWuayD0kz+qUyHpZXdVZqO8Ujvq2fcb/1CcLlFp39Vo+yPkF7zqh/MoWOVXR08z/djf52ICezqg25qMtHIPeLW+bgqOWB1kvSJt5TTnIqXTYtLTuzwuykixNgdPEJupxuqkvnnkN+AdlHk2ygk3RdUKxg38e3VOZk3dF1Nj05ygSv62nFSnlRA76wFKJbRlAvvQHXTDnXTkbrLKJUScTTJAvWcINXgjc9TGOAOY9w1WjrqzLFNLyDrd+5ZTZzGoWZ36kuFgSNBzB4hTdocSaaTo43Ne9xGYNB0113r5l4r2j7ny/k45+qtvR/jLDTGOQsY6Mm5JDczTqHG+/iFR+kLaCCoDIYXZ8ri5zh6u6wAPHfwWOmPAjzUfMvqYXU0+Ll7SoyvLNCV4jcnnG6VHsFLI7TxCZaUSu0Kg7tHJoO4fJeukUCkku1p+y35BSA5BIzrJ+keotTsb70o/lBK0udYf0jz6ws++75AfitIxjnJmRy9uKjyOVCNcvZKYuvQcopzMi6bcUgKiFeVG9q6eeVHGpU2JAXpoXhgT0YQe7WSZ14lemelQf/Z", "alt", ""], [1, "container"], ["mat-raised-button", "", 3, "click"]], template: function UserbuttonComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](0, UserbuttonComponent_mat_card_0_Template, 16, 7, "mat-card", 0);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.searchResult.username);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_4__["NgIf"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCard"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCardHeader"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCardAvatar"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCardTitle"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCardSubtitle"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCardContent"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCardActions"], _angular_material_button__WEBPACK_IMPORTED_MODULE_6__["MatButton"]], pipes: [_pipes_null_pipe__WEBPACK_IMPORTED_MODULE_7__["NullPipe"]], styles: [".inline[_ngcontent-%COMP%] {\n  text-align: left;\n}\n\n.mainCard[_ngcontent-%COMP%]:hover {\n  cursor: pointer;\n}\n\nbutton[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFwuLlxcLi5cXHVzZXJidXR0b24uY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxnQkFBQTtBQUNGOztBQUVBO0VBQ0UsZUFBQTtBQUNGOztBQUVBO0VBQ0UsYUFBQTtBQUNGIiwiZmlsZSI6InVzZXJidXR0b24uY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuaW5saW5le1xyXG4gIHRleHQtYWxpZ246IGxlZnQ7XHJcbn1cclxuXHJcbi5tYWluQ2FyZDpob3ZlciB7XHJcbiAgY3Vyc29yOiBwb2ludGVyO1xyXG59XHJcblxyXG5idXR0b246Zm9jdXMge1xyXG4gIG91dGxpbmU6IG5vbmU7XHJcbn0iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](UserbuttonComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-userbutton',
                templateUrl: './userbutton.component.html',
                styleUrls: ['./userbutton.component.scss']
            }]
    }], function () { return [{ type: src_app_services_search_service__WEBPACK_IMPORTED_MODULE_1__["SearchService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] }, { type: src_app_services_http_service__WEBPACK_IMPORTED_MODULE_3__["HttpService"] }]; }, { result: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }] }); })();


/***/ }),

/***/ "LpW2":
/*!*********************************************!*\
  !*** ./src/environments/environment.dev.ts ***!
  \*********************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
/* harmony import */ var _environment_prod__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./environment.prod */ "cxbk");

const environment = Object.assign(Object.assign({}, _environment_prod__WEBPACK_IMPORTED_MODULE_0__["environment"]), { production: false });


/***/ }),

/***/ "N+K7":
/*!******************************************!*\
  !*** ./src/app/services/http.service.ts ***!
  \******************************************/
/*! exports provided: HttpService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HttpService", function() { return HttpService; });
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../../environments/environment */ "AytR");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "IheW");




// http service that gives httpclient to everything
class HttpService {
    constructor(http) {
        this.http = http;
        this.serverURL = _environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].travelnetURL;
    }
    delete(route, params) {
        const serverRoute = this.serverURL + route;
        return new Promise((resolve, reject) => {
            this.http.delete(serverRoute, {
                headers: {
                    authorization: localStorage.getItem('token') ? localStorage.getItem('token').toString() : 'monkas'
                },
                params
            }).subscribe((res) => {
                resolve(res);
            }, (err) => {
                reject(err);
            });
        });
    }
    get(route, params) {
        const serverRoute = this.serverURL + route;
        return new Promise((resolve, reject) => {
            this.http.get(serverRoute, {
                headers: {
                    authorization: localStorage.getItem('token') ? localStorage.getItem('token').toString() : 'monkas'
                },
                params
            }).subscribe((res) => {
                resolve(res);
            }, (err) => {
                reject(err);
            });
        });
    }
    post(route, params) {
        const serverRoute = this.serverURL + route;
        return new Promise((resolve, reject) => {
            this.http.post(serverRoute, params).subscribe((res) => {
                resolve(res);
            }, (err) => {
                reject(err);
            });
        });
    }
    put(route, params) {
        const serverRoute = this.serverURL + route;
        return new Promise((resolve, reject) => {
            this.http.put(serverRoute, {
                headers: {
                    authorization: localStorage.getItem('token') ? localStorage.getItem('token').toString() : 'monkas'
                },
                params
            }).subscribe((res) => {
                resolve(res);
            }, (err) => {
                reject(err);
            });
        });
    }
    patch(route, params) {
        const serverRoute = this.serverURL + route;
        return new Promise((resolve, reject) => {
            this.http.patch(serverRoute, {
                headers: {
                    authorization: localStorage.getItem('token') ? localStorage.getItem('token').toString() : 'monkas'
                },
                params
            }).subscribe((res) => {
                resolve(res);
            }, (err) => {
                reject(err);
            });
        });
    }
}
HttpService.ɵfac = function HttpService_Factory(t) { return new (t || HttpService)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"])); };
HttpService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: HttpService, factory: HttpService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](HttpService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"] }]; }, null); })();


/***/ }),

/***/ "O3zK":
/*!*************************************************************!*\
  !*** ./src/app/components/loginpage/loginpage.component.ts ***!
  \*************************************************************/
/*! exports provided: loginComponent, LoginComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loginComponent", function() { return loginComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoginComponent", function() { return LoginComponent; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "G0yt");
/* harmony import */ var src_app_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/services/chatsystem/socket.service */ "QeH8");
/* harmony import */ var src_app_services_session_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/services/session.service */ "IfdK");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/card */ "PDjf");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/input */ "e6WT");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");
















function LoginComponent_small_12_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "small", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "Please enter something");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
function LoginComponent_small_17_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "small", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "Please enter something");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
class loginComponent {
    constructor(modalService) {
        this.modalService = modalService;
        this.modal = null;
        this.openModal();
    }
    openModal() {
        this.modal = this.modalService.open(LoginComponent, {});
    }
}
loginComponent.ɵfac = function loginComponent_Factory(t) { return new (t || loginComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__["NgbModal"])); };
loginComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: loginComponent, selectors: [["app-login"]], decls: 0, vars: 0, template: function loginComponent_Template(rf, ctx) { }, styles: ["#slot[_ngcontent-%COMP%] {\n  width: 360px;\n  height: 360px;\n  position: fixed;\n  right: 290px;\n}\n\n.hr-text[_ngcontent-%COMP%] {\n  line-height: 1em;\n  position: relative;\n  outline: 0;\n  border: 0;\n  color: black;\n  text-align: center;\n  height: 1.5em;\n  opacity: 1;\n}\n\n.hr-text[_ngcontent-%COMP%]:before {\n  content: \"\";\n  background: linear-gradient(to right, transparent, #818078, transparent);\n  position: absolute;\n  left: 0;\n  top: 50%;\n  width: 100%;\n  height: 1px;\n}\n\n.hr-text[_ngcontent-%COMP%]:after {\n  content: attr(data-content);\n  position: relative;\n  display: inline-block;\n  color: black;\n  padding: 0 0.5em;\n  line-height: 1.5em;\n  color: #818078;\n  background-color: rgba(255, 255, 255, 0.9);\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxsb2dpbnBhZ2UuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxZQUFBO0VBQ0EsYUFBQTtFQUNBLGVBQUE7RUFDQSxZQUFBO0FBQ0o7O0FBTUE7RUFDSSxnQkFBQTtFQUNBLGtCQUFBO0VBQ0EsVUFBQTtFQUNBLFNBQUE7RUFDQSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSxhQUFBO0VBQ0EsVUFBQTtBQUhKOztBQUlJO0VBQ0UsV0FBQTtFQUdBLHdFQUFBO0VBQ0Esa0JBQUE7RUFDQSxPQUFBO0VBQ0EsUUFBQTtFQUNBLFdBQUE7RUFDQSxXQUFBO0FBSk47O0FBTUk7RUFDRSwyQkFBQTtFQUNBLGtCQUFBO0VBQ0EscUJBQUE7RUFDQSxZQUFBO0VBRUEsZ0JBQUE7RUFDQSxrQkFBQTtFQUVBLGNBQUE7RUFDQSwwQ0FBQTtBQU5OIiwiZmlsZSI6ImxvZ2lucGFnZS5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIiNzbG90IHtcclxuICAgIHdpZHRoOiAzNjBweDtcclxuICAgIGhlaWdodDogMzYwcHg7XHJcbiAgICBwb3NpdGlvbjogZml4ZWQ7XHJcbiAgICByaWdodDogMjkwcHg7XHJcbn1cclxuXHJcbmlucHV0Lm5nLWludmFsaWQubmctdG91Y2hlZCB7XHJcbiAgICAvLyBib3JkZXI6IDFweCBzb2xpZCByZWQ7XHJcbn1cclxuXHJcbi5oci10ZXh0IHtcclxuICAgIGxpbmUtaGVpZ2h0OiAxZW07XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICBvdXRsaW5lOiAwO1xyXG4gICAgYm9yZGVyOiAwO1xyXG4gICAgY29sb3I6IGJsYWNrO1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gICAgaGVpZ2h0OiAxLjVlbTtcclxuICAgIG9wYWNpdHk6IDE7XHJcbiAgICAmOmJlZm9yZSB7XHJcbiAgICAgIGNvbnRlbnQ6ICcnO1xyXG4gICAgICAvLyB1c2UgdGhlIGxpbmVhci1ncmFkaWVudCBmb3IgdGhlIGZhZGluZyBlZmZlY3RcclxuICAgICAgLy8gdXNlIGEgc29saWQgYmFja2dyb3VuZCBjb2xvciBmb3IgYSBzb2xpZCBiYXJcclxuICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRvIHJpZ2h0LCB0cmFuc3BhcmVudCwgIzgxODA3OCwgdHJhbnNwYXJlbnQpO1xyXG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICAgIGxlZnQ6IDA7XHJcbiAgICAgIHRvcDogNTAlO1xyXG4gICAgICB3aWR0aDogMTAwJTtcclxuICAgICAgaGVpZ2h0OiAxcHg7XHJcbiAgICB9XHJcbiAgICAmOmFmdGVyIHtcclxuICAgICAgY29udGVudDogYXR0cihkYXRhLWNvbnRlbnQpO1xyXG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcclxuICAgICAgY29sb3I6IGJsYWNrO1xyXG4gIFxyXG4gICAgICBwYWRkaW5nOiAwIC41ZW07XHJcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjVlbTtcclxuICAgICAgLy8gdGhpcyBpcyByZWFsbHkgdGhlIG9ubHkgdHJpY2t5IHBhcnQsIHlvdSBuZWVkIHRvIHNwZWNpZnkgdGhlIGJhY2tncm91bmQgY29sb3Igb2YgdGhlIGNvbnRhaW5lciBlbGVtZW50Li4uXHJcbiAgICAgIGNvbG9yOiAjODE4MDc4O1xyXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKCRjb2xvcjogI2ZmZmZmZiwgJGFscGhhOiAwLjkpO1xyXG4gICAgfVxyXG4gIH0iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](loginComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"],
        args: [{
                selector: 'app-login',
                templateUrl: './login.component.html',
                styleUrls: ['./loginpage.component.scss'],
            }]
    }], function () { return [{ type: _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__["NgbModal"] }]; }, null); })();
class LoginComponent {
    constructor(SocketService, sessionService, modalService, router) {
        this.SocketService = SocketService;
        this.sessionService = sessionService;
        this.modalService = modalService;
        this.router = router;
        this.login_err = false;
        this.hide = true;
    }
    ngOnInit() {
        this.loginForm = new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroup"]({
            username: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](null, _angular_forms__WEBPACK_IMPORTED_MODULE_0__["Validators"].required),
            password: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](null, _angular_forms__WEBPACK_IMPORTED_MODULE_0__["Validators"].required)
        });
    }
    // handle user login with socket
    loginClicked() {
        if (!(sessionStorage.getItem('username'))) {
            const credentials = {
                email: this.loginForm.get('username').value,
                password: this.loginForm.get('password').value
            };
            this.login_err = false;
            this.SocketService.emit('login', credentials, (data) => {
                if (data.err || data === '') {
                    console.log(data.err);
                    this.login_err = true;
                    this.loginForm.get('password').reset();
                }
                else if (data.res) {
                    sessionStorage.setItem('username', data.res);
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.res);
                    this.modalService.dismissAll();
                    this.sessionService.session();
                    this.router.navigate(['/home']);
                }
                else {
                    console.log('login fini');
                }
            });
        }
        else {
            sessionStorage.removeItem('username');
            this.loginClicked();
        }
    }
    ngOnDestroy() {
        // this.router.navigate(['/'])
    }
}
LoginComponent.ɵfac = function LoginComponent_Factory(t) { return new (t || LoginComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](src_app_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_3__["SocketService"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](src_app_services_session_service__WEBPACK_IMPORTED_MODULE_4__["SessionService"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__["NgbModal"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"])); };
LoginComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: LoginComponent, selectors: [["app-loginpage"]], features: [_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵProvidersFeature"]([_ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__["NgbModalConfig"], _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__["NgbModal"]])], decls: 28, vars: 7, consts: [[1, ""], ["ngbAutofocus", "", "id", "form", 1, "modal-body", 3, "formGroup", "ngSubmit"], [1, "modal-title"], ["appearance", "outline", "id", "username", 1, "form-group"], ["for", "username"], ["matInput", "", "formControlName", "username", "placeholder", "Enter a Username", "autocomplete", "off"], ["class", "help-block text-danger", 4, "ngIf"], ["appearance", "outline", 1, "form-group", "col-6"], ["for", "password"], ["matInput", "", "placeholder", "Enter a password", "formControlName", "password", "autocomplete", "false", 3, "type"], ["mat-button", "", "type", "button", "mat-icon-button", "", "matSuffix", "", 3, "click"], ["mat-raised-button", "", "type", "submit", "id", "submit", "color", "primary", "aria-required", "true"], ["data-content", "OR", 1, "hr-text"], [1, "row", 2, "padding-left", "25%", "padding-right", "25%"], ["mat-raised-button", "", "color", "primary", "routerLink", "/register", 1, "col"], [1, "help-block", "text-danger"]], template: function LoginComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "mat-card", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "mat-card-content", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "form", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("ngSubmit", function LoginComponent_Template_form_ngSubmit_4_listener() { return ctx.loginClicked(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "h1", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](6, "Login");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](7, "hr");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](8, "mat-form-field", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](9, "mat-label", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](10, "Email or Username");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](11, "input", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](12, LoginComponent_small_12_Template, 2, 0, "small", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](13, "mat-form-field", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](14, "mat-label", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](15, "Password");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](16, "input", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](17, LoginComponent_small_17_Template, 2, 0, "small", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](18, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function LoginComponent_Template_button_click_18_listener() { return ctx.hide = !ctx.hide; });
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](19, "mat-icon");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](20);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](21, "button", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](22, "Login");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](23, "hr", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](24, "mat-card", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](25, "mat-card-content", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](26, "button", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](27, "Register");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("formGroup", ctx.loginForm);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](8);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", !ctx.loginForm.get("username").valid && ctx.loginForm.get("username").touched);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("type", ctx.hide ? "password" : "text");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", !ctx.loginForm.get("password").valid && ctx.loginForm.get("password").touched);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵattribute"]("aria-label", "Hide password")("aria-pressed", ctx.hide);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx.hide ? "visibility_off" : "visibility");
    } }, directives: [_angular_material_card__WEBPACK_IMPORTED_MODULE_6__["MatCard"], _angular_material_card__WEBPACK_IMPORTED_MODULE_6__["MatCardContent"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroupDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_7__["ɵa"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_9__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControlName"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_7__["ɵk"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_7__["ɵe"], _angular_common__WEBPACK_IMPORTED_MODULE_10__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_11__["MatButton"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__["MatSuffix"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_12__["MatIcon"], _angular_router__WEBPACK_IMPORTED_MODULE_5__["RouterLink"]], styles: ["#slot[_ngcontent-%COMP%] {\n  width: 360px;\n  height: 360px;\n  position: fixed;\n  right: 290px;\n}\n\n.hr-text[_ngcontent-%COMP%] {\n  line-height: 1em;\n  position: relative;\n  outline: 0;\n  border: 0;\n  color: black;\n  text-align: center;\n  height: 1.5em;\n  opacity: 1;\n}\n\n.hr-text[_ngcontent-%COMP%]:before {\n  content: \"\";\n  background: linear-gradient(to right, transparent, #818078, transparent);\n  position: absolute;\n  left: 0;\n  top: 50%;\n  width: 100%;\n  height: 1px;\n}\n\n.hr-text[_ngcontent-%COMP%]:after {\n  content: attr(data-content);\n  position: relative;\n  display: inline-block;\n  color: black;\n  padding: 0 0.5em;\n  line-height: 1.5em;\n  color: #818078;\n  background-color: rgba(255, 255, 255, 0.9);\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxsb2dpbnBhZ2UuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxZQUFBO0VBQ0EsYUFBQTtFQUNBLGVBQUE7RUFDQSxZQUFBO0FBQ0o7O0FBTUE7RUFDSSxnQkFBQTtFQUNBLGtCQUFBO0VBQ0EsVUFBQTtFQUNBLFNBQUE7RUFDQSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSxhQUFBO0VBQ0EsVUFBQTtBQUhKOztBQUlJO0VBQ0UsV0FBQTtFQUdBLHdFQUFBO0VBQ0Esa0JBQUE7RUFDQSxPQUFBO0VBQ0EsUUFBQTtFQUNBLFdBQUE7RUFDQSxXQUFBO0FBSk47O0FBTUk7RUFDRSwyQkFBQTtFQUNBLGtCQUFBO0VBQ0EscUJBQUE7RUFDQSxZQUFBO0VBRUEsZ0JBQUE7RUFDQSxrQkFBQTtFQUVBLGNBQUE7RUFDQSwwQ0FBQTtBQU5OIiwiZmlsZSI6ImxvZ2lucGFnZS5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIiNzbG90IHtcclxuICAgIHdpZHRoOiAzNjBweDtcclxuICAgIGhlaWdodDogMzYwcHg7XHJcbiAgICBwb3NpdGlvbjogZml4ZWQ7XHJcbiAgICByaWdodDogMjkwcHg7XHJcbn1cclxuXHJcbmlucHV0Lm5nLWludmFsaWQubmctdG91Y2hlZCB7XHJcbiAgICAvLyBib3JkZXI6IDFweCBzb2xpZCByZWQ7XHJcbn1cclxuXHJcbi5oci10ZXh0IHtcclxuICAgIGxpbmUtaGVpZ2h0OiAxZW07XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICBvdXRsaW5lOiAwO1xyXG4gICAgYm9yZGVyOiAwO1xyXG4gICAgY29sb3I6IGJsYWNrO1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gICAgaGVpZ2h0OiAxLjVlbTtcclxuICAgIG9wYWNpdHk6IDE7XHJcbiAgICAmOmJlZm9yZSB7XHJcbiAgICAgIGNvbnRlbnQ6ICcnO1xyXG4gICAgICAvLyB1c2UgdGhlIGxpbmVhci1ncmFkaWVudCBmb3IgdGhlIGZhZGluZyBlZmZlY3RcclxuICAgICAgLy8gdXNlIGEgc29saWQgYmFja2dyb3VuZCBjb2xvciBmb3IgYSBzb2xpZCBiYXJcclxuICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRvIHJpZ2h0LCB0cmFuc3BhcmVudCwgIzgxODA3OCwgdHJhbnNwYXJlbnQpO1xyXG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICAgIGxlZnQ6IDA7XHJcbiAgICAgIHRvcDogNTAlO1xyXG4gICAgICB3aWR0aDogMTAwJTtcclxuICAgICAgaGVpZ2h0OiAxcHg7XHJcbiAgICB9XHJcbiAgICAmOmFmdGVyIHtcclxuICAgICAgY29udGVudDogYXR0cihkYXRhLWNvbnRlbnQpO1xyXG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcclxuICAgICAgY29sb3I6IGJsYWNrO1xyXG4gIFxyXG4gICAgICBwYWRkaW5nOiAwIC41ZW07XHJcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjVlbTtcclxuICAgICAgLy8gdGhpcyBpcyByZWFsbHkgdGhlIG9ubHkgdHJpY2t5IHBhcnQsIHlvdSBuZWVkIHRvIHNwZWNpZnkgdGhlIGJhY2tncm91bmQgY29sb3Igb2YgdGhlIGNvbnRhaW5lciBlbGVtZW50Li4uXHJcbiAgICAgIGNvbG9yOiAjODE4MDc4O1xyXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKCRjb2xvcjogI2ZmZmZmZiwgJGFscGhhOiAwLjkpO1xyXG4gICAgfVxyXG4gIH0iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](LoginComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"],
        args: [{
                selector: 'app-loginpage',
                templateUrl: './loginpage.component.html',
                styleUrls: ['./loginpage.component.scss'],
                providers: [_ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__["NgbModalConfig"], _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__["NgbModal"]]
            }]
    }], function () { return [{ type: src_app_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_3__["SocketService"] }, { type: src_app_services_session_service__WEBPACK_IMPORTED_MODULE_4__["SessionService"] }, { type: _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__["NgbModal"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"] }]; }, null); })();


/***/ }),

/***/ "OM0W":
/*!*******************************************************************!*\
  !*** ./src/app/components/edit-comment/edit-comment.component.ts ***!
  \*******************************************************************/
/*! exports provided: EditCommentComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EditCommentComponent", function() { return EditCommentComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/material/dialog */ "iELJ");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var src_app_services_comments_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/services/comments.service */ "Tvdm");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/input */ "e6WT");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");













function EditCommentComponent_form_0_mat_error_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "Please enter something");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function EditCommentComponent_form_0_Template(rf, ctx) { if (rf & 1) {
    const _r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "form", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("submit", function EditCommentComponent_form_0_Template_form_submit_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r4); const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r3.onEditComment(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-form-field");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "input", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](3, EditCommentComponent_form_0_mat_error_3_Template, 2, 0, "mat-error", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "button", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5, "Save edit");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "button", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function EditCommentComponent_form_0_Template_button_click_6_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r4); const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r5.closeDialog(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](7, "close");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("formGroup", ctx_r0.form);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r0.form.get("comment").invalid);
} }
function EditCommentComponent_div_1_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const edit_r7 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate2"](" ", edit_r7.edit, ": ", edit_r7.date, " ");
} }
function EditCommentComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, EditCommentComponent_div_1_div_1_Template, 2, 2, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx_r1.data.commentData.comment.edited);
} }
class EditCommentComponent {
    constructor(dialogRef, CommentsService, data) {
        this.dialogRef = dialogRef;
        this.CommentsService = CommentsService;
        this.data = data;
    }
    ngOnInit() {
        if (!this.data.displayEdits) {
            this.form = new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormGroup"]({
                comment: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, { validators: [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required] }),
            });
            if (this.data.commentData.reply) {
                this.form.setValue({
                    comment: this.data.commentData.reply.content
                });
            }
            else {
                this.form.setValue({
                    comment: this.data.commentData.comment.content
                });
            }
            this.commentData = this.data.commentData;
        }
    }
    onEditComment() {
        if (this.data.commentData.reply) {
            this.commentData.reply.edited.push({ edit: this.commentData.reply.content, date: Date().toLocaleString() });
            this.commentData.reply.content = this.form.value.comment;
            this.CommentsService.editComment(this.commentData);
        }
        else {
            this.commentData.comment.edited.push({ edit: this.commentData.comment.content, date: Date().toLocaleString() });
            this.commentData.comment.content = this.form.value.comment;
            this.CommentsService.editComment(this.commentData);
        }
        this.closeDialog();
    }
    closeDialog() {
        this.dialogRef.close();
    }
}
EditCommentComponent.ɵfac = function EditCommentComponent_Factory(t) { return new (t || EditCommentComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MatDialogRef"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_comments_service__WEBPACK_IMPORTED_MODULE_3__["CommentsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MAT_DIALOG_DATA"])); };
EditCommentComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: EditCommentComponent, selectors: [["app-edit-comment"]], decls: 2, vars: 2, consts: [[3, "formGroup", "submit", 4, "ngIf"], [4, "ngIf"], [3, "formGroup", "submit"], ["matInput", "", "type", "text", "formControlName", "comment", "placeholder", ""], ["mat-raised-button", "", "color", "accent", "type", "submit"], ["mat-raised-button", "", "type", "button", 3, "click"], [4, "ngFor", "ngForOf"]], template: function EditCommentComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](0, EditCommentComponent_form_0_Template, 8, 2, "form", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, EditCommentComponent_div_1_Template, 2, 1, "div", 1);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", !ctx.data.displayEdits);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.data.displayEdits);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_4__["NgIf"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormGroupDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_5__["ɵa"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_6__["MatFormField"], _angular_material_input__WEBPACK_IMPORTED_MODULE_7__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControlName"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_5__["ɵk"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_5__["ɵe"], _angular_material_button__WEBPACK_IMPORTED_MODULE_8__["MatButton"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_6__["MatError"], _angular_common__WEBPACK_IMPORTED_MODULE_4__["NgForOf"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJlZGl0LWNvbW1lbnQuY29tcG9uZW50LnNjc3MifQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](EditCommentComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-edit-comment',
                templateUrl: './edit-comment.component.html',
                styleUrls: ['./edit-comment.component.scss']
            }]
    }], function () { return [{ type: _angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MatDialogRef"] }, { type: src_app_services_comments_service__WEBPACK_IMPORTED_MODULE_3__["CommentsService"] }, { type: undefined, decorators: [{
                type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Inject"],
                args: [_angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MAT_DIALOG_DATA"]]
            }] }]; }, null); })();


/***/ }),

/***/ "OlRB":
/*!***********************************************************************************!*\
  !*** ./src/app/components/registration-process/registration-process.component.ts ***!
  \***********************************************************************************/
/*! exports provided: RegistrationProcessComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RegistrationProcessComponent", function() { return RegistrationProcessComponent; });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _services_map_map_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./../../services/map/map.service */ "HYNq");
/* harmony import */ var src_app_services_session_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/services/session.service */ "IfdK");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var _angular_material_stepper__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/stepper */ "hzfI");
/* harmony import */ var _registrationpage_registrationpage_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./registrationpage/registrationpage.component */ "ijTB");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _country_selector_country_selector_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./country-selector/country-selector.component */ "AALG");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/progress-spinner */ "pu8Q");















const _c0 = ["stepper"];
const _c1 = ["step1"];
const _c2 = ["selector1"];
const _c3 = ["selector2"];
const _c4 = ["registration"];
const _c5 = ["progressUpdate"];
function RegistrationProcessComponent_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "check");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
function RegistrationProcessComponent_button_29_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "button", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "mat-spinner", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
function RegistrationProcessComponent_button_30_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "button", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "Preferences Saved!");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} }
class RegistrationProcessComponent {
    constructor(_formBuilder, MapService, SessionService, Router) {
        this._formBuilder = _formBuilder;
        this.MapService = MapService;
        this.SessionService = SessionService;
        this.Router = Router;
        this.editable = true;
        this._progressUpdate = new rxjs__WEBPACK_IMPORTED_MODULE_0__["BehaviorSubject"]({
            target: 0,
            coordinates: []
        });
        this.progressUpdate = this._progressUpdate.asObservable();
        this.isSaving = false;
        this.isDone = false;
    }
    ngOnInit() {
        this.firstFormGroup = this._formBuilder.group({
            firstCtrl: ['']
        });
        this.secondFormGroup = this._formBuilder.group({
            secondCtrl: ''
        });
        this.sessionState_sub = this.SessionService.sessionState.subscribe((state) => {
            this.sessionState = state;
        });
    }
    ngAfterViewInit() {
        this.step1.stepControl = this.registration.registrationForm;
        this.clickLocation = this.MapService.clickLocation.subscribe((x) => {
            this._progressUpdate.next({
                target: this.stepper.selectedIndex,
                coordinates: [x.lng, x.lat]
            });
        });
        this.stepper_sub = this.stepper.selectionChange.subscribe(x => {
            console.log(this.stepper.steps);
            if (x.selectedIndex != 0) {
                this.editable = false;
                this.isDone = false;
                this.MapService.showMarker(x.selectedIndex);
            }
        });
    }
    registerClicked() {
        this.registration.onSubmit();
    }
    onClear(target) {
    }
    savePreferences() {
        this.isSaving = true;
        Promise.all([this.selector1.onSumbit(), this.selector2.onSumbit()])
            .then((responses) => {
            this.isDone = true;
            setTimeout(() => {
                this.Router.navigate(['/home']);
            }, 500);
        })
            .catch((err) => {
            alert(err[0]);
            // window.location.reload()
        })
            .finally(() => {
            this.isSaving = false;
        });
    }
    ngOnDestroy() {
        // this.Router.navigate(['/'])
        this.clickLocation.unsubscribe();
        this.stepper_sub.unsubscribe();
        this.sessionState_sub.unsubscribe();
    }
}
RegistrationProcessComponent.ɵfac = function RegistrationProcessComponent_Factory(t) { return new (t || RegistrationProcessComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_services_map_map_service__WEBPACK_IMPORTED_MODULE_3__["MapService"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](src_app_services_session_service__WEBPACK_IMPORTED_MODULE_4__["SessionService"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"])); };
RegistrationProcessComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: RegistrationProcessComponent, selectors: [["app-registration-process"]], viewQuery: function RegistrationProcessComponent_Query(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵviewQuery"](_c0, true);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵviewQuery"](_c1, true);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵviewQuery"](_c2, true);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵviewQuery"](_c3, true);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵviewQuery"](_c4, true);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵviewQuery"](_c5, true);
    } if (rf & 2) {
        var _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵloadQuery"]()) && (ctx.stepper = _t.first);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵloadQuery"]()) && (ctx.step1 = _t.first);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵloadQuery"]()) && (ctx.selector1 = _t.first);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵloadQuery"]()) && (ctx.selector2 = _t.first);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵloadQuery"]()) && (ctx.registration = _t.first);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵloadQuery"]()) && (ctx.progressUpdate = _t.first);
    } }, decls: 31, vars: 11, consts: [["linear", ""], ["stepper", ""], ["matStepperIcon", "edit"], ["label", "Create Your Account", 3, "editable", "optional"], ["step1", ""], [3, "stepper"], ["registration", ""], ["label", "Where You've Been", 3, "optional"], [3, "progressUpdate", "target"], ["selector1", ""], ["mat-stroked-button", "", "matStepperNext", "", "color", "primary"], ["label", "Where Do You Want To Go", 3, "optional"], ["selector2", ""], ["mat-button", "", "matStepperPrevious", ""], ["mat-raised-button", "", "color", "primary", 3, "click"], ["mat-button", "", 4, "ngIf"], ["mat-button", "", "class", "text-success", 4, "ngIf"], ["mat-button", ""], ["diameter", "32"], ["mat-button", "", 1, "text-success"]], template: function RegistrationProcessComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "mat-horizontal-stepper", 0, 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](2, RegistrationProcessComponent_ng_template_2_Template, 2, 0, "ng-template", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "mat-step", 3, 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](5, "app-registrationpage", 5, 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](7, "mat-step", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](8, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](9, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](10, "h2");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](11, "Tell Us About The Places You Enjoyed Most");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](12, "app-country-selector", 8, 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](14, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](15, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](16, "Next");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](17, "mat-step", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](18, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](19, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](20, "h2");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](21, "Tell Us About Places You Would Like to Discover");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](22, "app-country-selector", 8, 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](24, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](25, "button", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](26, "Back");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](27, "button", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function RegistrationProcessComponent_Template_button_click_27_listener() { return ctx.savePreferences(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](28, "Save");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](29, RegistrationProcessComponent_button_29_Template, 2, 0, "button", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](30, RegistrationProcessComponent_button_30_Template, 2, 0, "button", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    } if (rf & 2) {
        const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("editable", ctx.editable)("optional", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("stepper", _r0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("optional", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("progressUpdate", _r0.selectedIndex)("target", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("optional", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("progressUpdate", _r0.selectedIndex)("target", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](7);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.isSaving);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.isDone);
    } }, directives: [_angular_material_stepper__WEBPACK_IMPORTED_MODULE_6__["MatHorizontalStepper"], _angular_material_stepper__WEBPACK_IMPORTED_MODULE_6__["MatStepperIcon"], _angular_material_stepper__WEBPACK_IMPORTED_MODULE_6__["MatStep"], _registrationpage_registrationpage_component__WEBPACK_IMPORTED_MODULE_7__["RegistrationComponent"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__["MatLabel"], _country_selector_country_selector_component__WEBPACK_IMPORTED_MODULE_9__["CountrySelectorComponent"], _angular_material_button__WEBPACK_IMPORTED_MODULE_10__["MatButton"], _angular_material_stepper__WEBPACK_IMPORTED_MODULE_6__["MatStepperNext"], _angular_material_stepper__WEBPACK_IMPORTED_MODULE_6__["MatStepperPrevious"], _angular_common__WEBPACK_IMPORTED_MODULE_11__["NgIf"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_12__["MatIcon"], _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_13__["MatSpinner"]], styles: ["[_nghost-%COMP%]     .mat-horizontal-content-container {\n  padding: 1% !important;\n}\n\nmat-horizontal-stepper[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\nbutton[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxyZWdpc3RyYXRpb24tcHJvY2Vzcy5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLHNCQUFBO0FBQ0o7O0FBRUE7RUFDSSxXQUFBO0FBQ0o7O0FBRUE7RUFDSSxhQUFBO0FBQ0oiLCJmaWxlIjoicmVnaXN0cmF0aW9uLXByb2Nlc3MuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyI6aG9zdCA6Om5nLWRlZXAgLm1hdC1ob3Jpem9udGFsLWNvbnRlbnQtY29udGFpbmVyIHtcclxuICAgIHBhZGRpbmc6MSUgIWltcG9ydGFudDtcclxufVxyXG5cclxubWF0LWhvcml6b250YWwtc3RlcHBlciB7XHJcbiAgICB3aWR0aDogMTAwJTtcclxufVxyXG5cclxuYnV0dG9uOmZvY3VzIHtcclxuICAgIG91dGxpbmU6IG5vbmU7XHJcbn0iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](RegistrationProcessComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"],
        args: [{
                selector: 'app-registration-process',
                templateUrl: './registration-process.component.html',
                styleUrls: ['./registration-process.component.scss']
            }]
    }], function () { return [{ type: _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormBuilder"] }, { type: _services_map_map_service__WEBPACK_IMPORTED_MODULE_3__["MapService"] }, { type: src_app_services_session_service__WEBPACK_IMPORTED_MODULE_4__["SessionService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"] }]; }, { stepper: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"],
            args: ['stepper']
        }], step1: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"],
            args: ['step1']
        }], selector1: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"],
            args: ['selector1']
        }], selector2: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"],
            args: ['selector2']
        }], registration: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"],
            args: ['registration']
        }], progressUpdate: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"],
            args: ['progressUpdate']
        }] }); })();


/***/ }),

/***/ "P1Wc":
/*!*****************************************************************!*\
  !*** ./src/app/components/userprofile/userprofile.component.ts ***!
  \*****************************************************************/
/*! exports provided: UserprofileComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UserprofileComponent", function() { return UserprofileComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_search_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/search.service */ "l3hs");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var _services_http_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./../../services/http.service */ "N+K7");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/card */ "PDjf");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/tooltip */ "ZFy/");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");
/* harmony import */ var _pipes_null_pipe__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../pipes/null.pipe */ "STwT");











function UserprofileComponent_mat_card_0_button_3_Template(rf, ctx) { if (rf & 1) {
    const _r8 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function UserprofileComponent_mat_card_0_button_3_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r8); const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r7.goBack(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-icon", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, " keyboard_backspace ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function UserprofileComponent_mat_card_0_div_4_Template(rf, ctx) { if (rf & 1) {
    const _r10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "button", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function UserprofileComponent_mat_card_0_div_4_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r10); const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r9.onFollow(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, " Follow ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function UserprofileComponent_mat_card_0_div_5_Template(rf, ctx) { if (rf & 1) {
    const _r12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "button", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function UserprofileComponent_mat_card_0_div_5_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r12); const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r11.onUnfollow(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, " Unfollow ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function UserprofileComponent_mat_card_0_div_13_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r13 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", item_r13, " ");
} }
const _c0 = function () { return ["continent"]; };
const _c1 = function () { return ["places"]; };
function UserprofileComponent_mat_card_0_p_18_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](3, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r14 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind2"](2, 1, item_r14, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](7, _c0)) + _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind2"](3, 4, item_r14, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](8, _c1)));
} }
function UserprofileComponent_mat_card_0_p_22_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r15 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind2"](2, 1, item_r15, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](4, _c1)));
} }
const _c2 = function () { return ["username"]; };
const _c3 = function () { return ["profilepicture"]; };
const _c4 = function () { return ["trips"]; };
function UserprofileComponent_mat_card_0_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-card", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](3, UserprofileComponent_mat_card_0_button_3_Template, 3, 0, "button", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](4, UserprofileComponent_mat_card_0_div_4_Template, 3, 0, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](5, UserprofileComponent_mat_card_0_div_5_Template, 3, 0, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](8, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](9, "a", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](10, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "mat-card-content");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](13, UserprofileComponent_mat_card_0_div_13_Template, 2, 1, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](14, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](15, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](16, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](17, "history: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](18, UserprofileComponent_mat_card_0_p_18_Template, 4, 9, "p", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](19, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](20, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](21, "wishlist: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](22, UserprofileComponent_mat_card_0_p_22_Template, 3, 5, "p", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r0.openTab);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", !ctx_r0.content.followers.includes(ctx_r0.selfUsername));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r0.content.followers.includes(ctx_r0.selfUsername));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind2"](8, 8, ctx_r0.content, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](17, _c2)));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("href", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind2"](10, 11, ctx_r0.content, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](18, _c3)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind2"](14, 14, ctx_r0.content, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](19, _c4)));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx_r0.content.history);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx_r0.content.wishlist);
} }
class UserprofileComponent {
    constructor(SearchService, router, HttpService) {
        this.SearchService = SearchService;
        this.router = router;
        this.HttpService = HttpService;
        this.url = null;
        this.content = null;
        this.windowHeight = window.innerHeight;
    }
    ngOnInit() {
        this.openTabSub = this.SearchService.searchTab.subscribe(x => {
            this.openTab = x;
        });
        this.url = this.router.url.replace('/search/user/', '');
        this.searchUser(this.url).then(result => this.content = result.users[0]);
        this.username = this.router.url.substr(13);
        this.selfUsername = localStorage.getItem('username');
    }
    goBack() {
        this.router.navigate(['search', this.openTab.query]);
    }
    searchUser(username) {
        return new Promise((resolve) => {
            this.SearchService.userSearch(username).then(result => {
                console.log(result);
                resolve(result);
            });
        });
    }
    ngOnDestroy() {
        this.openTabSub.unsubscribe();
    }
    // follow button
    onFollow() {
        // update database
        this.HttpService.post('/user/follow', {
            username: localStorage.getItem('username'),
            followed: this.username
        }).then((res) => {
            // add the follower in current content
            this.content.followers.push(this.selfUsername);
        }).catch((err) => {
            console.log(err);
        });
    }
    // unfollow button
    onUnfollow() {
        // update database
        this.HttpService.post('/user/unfollow', {
            username: localStorage.getItem('username'),
            unfollowed: this.username
        }).then((res) => {
            // remove the follower from current content
            this.content.followers.splice(this.content.followers.indexOf(this.selfUsername), 1);
        }).catch((err) => {
            console.log(err);
        });
    }
}
UserprofileComponent.ɵfac = function UserprofileComponent_Factory(t) { return new (t || UserprofileComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_search_service__WEBPACK_IMPORTED_MODULE_1__["SearchService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_http_service__WEBPACK_IMPORTED_MODULE_3__["HttpService"])); };
UserprofileComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: UserprofileComponent, selectors: [["app-userprofile"]], decls: 1, vars: 1, consts: [["class", "container", 4, "ngIf"], [1, "container"], [1, "row"], ["mat-button", "", "class", "col-auto", "matTooltip", "back", 3, "click", 4, "ngIf"], [4, "ngIf"], [1, "img", 3, "href"], [4, "ngFor", "ngForOf"], ["mat-button", "", "matTooltip", "back", 1, "col-auto", 3, "click"], [1, ""], ["mat-raised-button", "", 3, "click"]], template: function UserprofileComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](0, UserprofileComponent_mat_card_0_Template, 23, 20, "mat-card", 0);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.content);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_4__["NgIf"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCard"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCardTitle"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCardContent"], _angular_common__WEBPACK_IMPORTED_MODULE_4__["NgForOf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_6__["MatButton"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_7__["MatTooltip"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_8__["MatIcon"]], pipes: [_pipes_null_pipe__WEBPACK_IMPORTED_MODULE_9__["NullPipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ1c2VycHJvZmlsZS5jb21wb25lbnQuc2NzcyJ9 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](UserprofileComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-userprofile',
                templateUrl: './userprofile.component.html',
                styleUrls: ['./userprofile.component.scss']
            }]
    }], function () { return [{ type: src_app_services_search_service__WEBPACK_IMPORTED_MODULE_1__["SearchService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] }, { type: _services_http_service__WEBPACK_IMPORTED_MODULE_3__["HttpService"] }]; }, null); })();


/***/ }),

/***/ "PAeE":
/*!************************************************************************************!*\
  !*** ./src/app/components/tabs/searchresults/VenueButton/VenueButton.component.ts ***!
  \************************************************************************************/
/*! exports provided: VenueButtonComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VenueButtonComponent", function() { return VenueButtonComponent; });
/* harmony import */ var _add_to_trip_popover_add_to_trip_popover_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../add-to-trip-popover/add-to-trip-popover.component */ "JVKH");
/* harmony import */ var src_app_models_coordinates__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/models/coordinates */ "FvPJ");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_search_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/services/search.service */ "l3hs");
/* harmony import */ var _services_trip_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./../../../../services/trip.service */ "W524");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! src/app/services/map/map.service */ "HYNq");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/card */ "PDjf");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/tooltip */ "ZFy/");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "G0yt");
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/progress-spinner */ "pu8Q");
/* harmony import */ var _pipes_null_pipe__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../../../pipes/null.pipe */ "STwT");

















function VenueButtonComponent_mat_card_0_p_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "p", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r8 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate"](item_r8.name);
} }
function VenueButtonComponent_mat_card_0_mat_icon_18_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "mat-icon", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1, "playlist_add");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](2);
    const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵreference"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngbPopover", _r1)("autoClose", "outside");
} }
function VenueButtonComponent_mat_card_0_mat_spinner_19_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](0, "mat-spinner", 16);
} }
function VenueButtonComponent_mat_card_0_mat_icon_20_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "mat-icon", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1, "check");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} }
function VenueButtonComponent_mat_card_0_mat_icon_21_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "mat-icon", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1, "error");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} }
const _c0 = function () { return ["venue", "name"]; };
const _c1 = function () { return ["venue", "categories"]; };
const _c2 = function () { return ["venue", "location", "address"]; };
function VenueButtonComponent_mat_card_0_Template(rf, ctx) { if (rf & 1) {
    const _r10 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "mat-card");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "mat-card-header", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function VenueButtonComponent_mat_card_0_Template_mat_card_header_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r10); const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](); return ctx_r9.navigate(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](2, "mat-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipe"](4, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](5, "mat-card-subtitle");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](6, VenueButtonComponent_mat_card_0_p_6_Template, 2, 1, "p", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipe"](7, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](8, "mat-card-content", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](9, "p", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function VenueButtonComponent_mat_card_0_Template_p_click_9_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r10); const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](); return ctx_r11.navigate(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipe"](11, "null");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](12, "hr");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](13, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](14, "button", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function VenueButtonComponent_mat_card_0_Template_button_click_14_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r10); const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](); return ctx_r12.showLocation(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](15, "mat-icon", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](16, "map");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](17, "button", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](18, VenueButtonComponent_mat_card_0_mat_icon_18_Template, 2, 2, "mat-icon", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](19, VenueButtonComponent_mat_card_0_mat_spinner_19_Template, 1, 0, "mat-spinner", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](20, VenueButtonComponent_mat_card_0_mat_icon_20_Template, 2, 0, "mat-icon", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](21, VenueButtonComponent_mat_card_0_mat_icon_21_Template, 2, 0, "mat-icon", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipeBind2"](4, 7, ctx_r0.searchResult, _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpureFunction0"](16, _c0)));
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipeBind2"](7, 10, ctx_r0.searchResult, _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpureFunction0"](17, _c1)));
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipeBind2"](11, 13, ctx_r0.searchResult, _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpureFunction0"](18, _c2)), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", !ctx_r0.isErr && !ctx_r0.isLoading && !ctx_r0.isSuccess);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx_r0.isLoading);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx_r0.isSuccess && !ctx_r0.isLoading);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx_r0.isErr && !ctx_r0.isLoading);
} }
function VenueButtonComponent_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    const _r14 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "app-add-to-trip-popover", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("onSubmitEvent", function VenueButtonComponent_ng_template_1_Template_app_add_to_trip_popover_onSubmitEvent_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r14); const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](); return ctx_r13.addToTrip($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} }
class VenueButtonComponent {
    constructor(SearchService, TripService, router, MapService) {
        this.SearchService = SearchService;
        this.TripService = TripService;
        this.router = router;
        this.MapService = MapService;
        this.trips = null;
        this.isLoading = false;
        this.isSuccess = false;
        this.isErr = false;
    }
    ngOnInit() {
        this.searchResult = this.result;
        this.pathID = '/search/venue/' + this.result.venue.id;
        this.trips_sub = this.TripService.trips.subscribe((triparr) => {
            if (triparr) {
                this.trips = triparr;
            }
        });
    }
    navigate() {
        this.router.navigate([this.pathID]);
    }
    /** add venue to specific trips */
    addToTrip(event) {
        this.isLoading = true;
        this.SearchService.formatDetails(this.result.venue.id)
            .then(result => {
            console.log(result);
            if (event.length && this.trips) {
                event.map((option) => {
                    this.trips[option.value.trip].schedule[option.value.day].venues.push({
                        name: result.response.venue.name ? result.response.venue.name : null,
                        venueAddress: result.response.venue.location.formattedAddress ? result.response.venue.location.formattedAddress.join(' ') : null,
                        venueCoord: result.response.venue.location.lng ? { lng: result.response.venue.location.lng, lat: result.response.venue.location.lat } : null,
                        venueCity: result.response.venue.location.city ? result.response.venue.location.city : null,
                        url: result.response.venue.canonicalUrl ? result.response.venue.canonicalUrl : null,
                        category: result.response.venue.categories[0] ? { name: result.response.venue.categories[0].name, url: result.response.venue.categories[0].icon.prefix + '32' + result.response.venue.categories[0].icon.suffix } : null
                    });
                });
                this.TripService.modifyBackend(this.trips)
                    .then((val) => {
                    this.isSuccess = true;
                })
                    .catch(err => {
                    this.isErr = true;
                });
            }
        })
            .catch(() => {
            this.isErr = true;
            setTimeout(() => {
                this.isErr = false;
            }, 800);
        })
            .finally(() => {
            this.isLoading = false;
        });
    }
    /** show venue location on map */
    showLocation() {
        this.MapService.venueOnDestroy();
        this.MapService.addMarker(new src_app_models_coordinates__WEBPACK_IMPORTED_MODULE_1__["CustomCoordinates"](this.result.venue.location.lng, this.result.venue.location.lat));
    }
    ngOnDestroy() {
        this.MapService.venueOnDestroy();
        this.trips_sub.unsubscribe();
        this.MapService.venueOnDestroy();
    }
}
VenueButtonComponent.ɵfac = function VenueButtonComponent_Factory(t) { return new (t || VenueButtonComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](src_app_services_search_service__WEBPACK_IMPORTED_MODULE_3__["SearchService"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_trip_service__WEBPACK_IMPORTED_MODULE_4__["TripService"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_6__["MapService"])); };
VenueButtonComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({ type: VenueButtonComponent, selectors: [["app-venueButton"]], viewQuery: function VenueButtonComponent_Query(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵviewQuery"](_add_to_trip_popover_add_to_trip_popover_component__WEBPACK_IMPORTED_MODULE_0__["AddToTripPopoverComponent"], true);
    } if (rf & 2) {
        var _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵloadQuery"]()) && (ctx.AddToTripPopoverComponent = _t.first);
    } }, inputs: { select: "select", result: "result" }, decls: 3, vars: 1, consts: [[4, "ngIf"], ["popContent", ""], [3, "click"], ["class", "inline", 4, "ngFor", "ngForOf"], [1, "container-fluid", "justify-content-end"], [1, "description", "text-right", "d-flex", "flex-row-reverse", 3, "click"], [1, "row", "justify-content-end"], ["mat-button", "", 1, "col-auto", "mr-auto", 3, "click"], ["mat-icon-button", "", "matTooltip", "show on map", "matTooltipPosition", "above", "color", "primary"], ["mat-button", "", 1, "col-auto", "mr-auto"], ["mat-icon-button", "", "matTooltipPosition", "above", "matTooltip", "add to trip...", 3, "ngbPopover", "autoClose", 4, "ngIf"], ["diameter", "20", 4, "ngIf"], ["mat-icon-button", "", "class", "text-success", 4, "ngIf"], ["mat-icon-button", "", "class", "text-danger", "matTooltip", "an error occured", 4, "ngIf"], [1, "inline"], ["mat-icon-button", "", "matTooltipPosition", "above", "matTooltip", "add to trip...", 3, "ngbPopover", "autoClose"], ["diameter", "20"], ["mat-icon-button", "", 1, "text-success"], ["mat-icon-button", "", "matTooltip", "an error occured", 1, "text-danger"], [3, "onSubmitEvent"]], template: function VenueButtonComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](0, VenueButtonComponent_mat_card_0_Template, 22, 19, "mat-card", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](1, VenueButtonComponent_ng_template_1_Template, 1, 0, "ng-template", null, 1, _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplateRefExtractor"]);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.searchResult.venue);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_7__["NgIf"], _angular_material_card__WEBPACK_IMPORTED_MODULE_8__["MatCard"], _angular_material_card__WEBPACK_IMPORTED_MODULE_8__["MatCardHeader"], _angular_material_card__WEBPACK_IMPORTED_MODULE_8__["MatCardTitle"], _angular_material_card__WEBPACK_IMPORTED_MODULE_8__["MatCardSubtitle"], _angular_common__WEBPACK_IMPORTED_MODULE_7__["NgForOf"], _angular_material_card__WEBPACK_IMPORTED_MODULE_8__["MatCardContent"], _angular_material_button__WEBPACK_IMPORTED_MODULE_9__["MatButton"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_10__["MatIcon"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_11__["MatTooltip"], _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_12__["NgbPopover"], _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_13__["MatSpinner"], _add_to_trip_popover_add_to_trip_popover_component__WEBPACK_IMPORTED_MODULE_0__["AddToTripPopoverComponent"]], pipes: [_pipes_null_pipe__WEBPACK_IMPORTED_MODULE_14__["NullPipe"]], styles: ["mat-card[_ngcontent-%COMP%] {\n  display: flex;\n}\n\n.inline[_ngcontent-%COMP%] {\n  text-align: left;\n}\n\nmat-card-header[_ngcontent-%COMP%]:hover, #description[_ngcontent-%COMP%]:hover, mat-icon[_ngcontent-%COMP%]:hover {\n  cursor: pointer;\n}\n\n.description[_ngcontent-%COMP%]:hover {\n  cursor: pointer;\n}\n\nbutton[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n\n  .popover {\n  max-width: 100%;\n  \n  min-width: 400px;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFwuLlxcLi5cXHZlbnVlQnV0dG9uLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsYUFBQTtBQUNGOztBQUVBO0VBQ0UsZ0JBQUE7QUFDRjs7QUFFQTtFQUNFLGVBQUE7QUFDRjs7QUFFQTtFQUNFLGVBQUE7QUFDRjs7QUFFQTtFQUNFLGFBQUE7QUFDRjs7QUFFQTtFQUNFLGVBQUE7RUFBaUIsMkRBQUE7RUFDakIsZ0JBQUE7QUFFRiIsImZpbGUiOiJ2ZW51ZUJ1dHRvbi5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIm1hdC1jYXJkIHtcclxuICBkaXNwbGF5OiBmbGV4O1xyXG59XHJcblxyXG4uaW5saW5lIHtcclxuICB0ZXh0LWFsaWduOiBsZWZ0O1xyXG59XHJcblxyXG5tYXQtY2FyZC1oZWFkZXI6aG92ZXIsICNkZXNjcmlwdGlvbjpob3ZlciwgbWF0LWljb246aG92ZXIge1xyXG4gIGN1cnNvcjogcG9pbnRlcjtcclxufVxyXG5cclxuLmRlc2NyaXB0aW9uOmhvdmVyIHtcclxuICBjdXJzb3I6IHBvaW50ZXI7XHJcbn1cclxuXHJcbmJ1dHRvbjpmb2N1cyB7XHJcbiAgb3V0bGluZTogbm9uZTtcclxufVxyXG5cclxuOjpuZy1kZWVwIC5wb3BvdmVye1xyXG4gIG1heC13aWR0aDogMTAwJTsgLyogTWF4IFdpZHRoIG9mIHRoZSBwb3BvdmVyIChkZXBlbmRpbmcgb24gdGhlIGNvbnRhaW5lciEpICovXHJcbiAgbWluLXdpZHRoOiA0MDBweDtcclxufSJdfQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵsetClassMetadata"](VenueButtonComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_2__["Component"],
        args: [{
                selector: 'app-venueButton',
                templateUrl: './venueButton.component.html',
                styleUrls: ['./venueButton.component.scss']
            }]
    }], function () { return [{ type: src_app_services_search_service__WEBPACK_IMPORTED_MODULE_3__["SearchService"] }, { type: _services_trip_service__WEBPACK_IMPORTED_MODULE_4__["TripService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"] }, { type: src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_6__["MapService"] }]; }, { select: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_2__["Input"]
        }], result: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_2__["Input"]
        }], AddToTripPopoverComponent: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_2__["ViewChild"],
            args: [_add_to_trip_popover_add_to_trip_popover_component__WEBPACK_IMPORTED_MODULE_0__["AddToTripPopoverComponent"]]
        }] }); })();


/***/ }),

/***/ "PiFF":
/*!****************************************************!*\
  !*** ./src/app/services/map/foursquare.service.ts ***!
  \****************************************************/
/*! exports provided: FoursquareService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FoursquareService", function() { return FoursquareService; });
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/environments/environment */ "AytR");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "IheW");




class FoursquareService {
    constructor(http) {
        this.http = http;
    }
    /** takes lat,lng */
    searchVenues(query, latLng, near) {
        return this.http
            .get(src_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].foursquare.venuesExplore, {
            headers: {},
            params: {
                client_id: src_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].foursquare.clientId,
                client_secret: src_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].foursquare.clientSecret,
                v: this.getCurrentDate(),
                ll: latLng,
                query
            }
        });
    }
    getDetails(query) {
        return this.http
            .get(src_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].foursquare.venueDetails + '/' + query, {
            headers: {},
            params: {
                client_id: src_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].foursquare.clientId,
                client_secret: src_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].foursquare.clientSecret,
                v: this.getCurrentDate(),
            }
        });
    }
    userAuth() {
        const url = src_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].foursquare.userAuth +
            '?client_id=' + src_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].foursquare.clientId +
            '&response_type=' + 'code' +
            '&redirect_uri=' + 'http://localhost:4200/';
        console.log(url);
        window.location.replace(url);
    }
    updateCategories() {
        return this.http
            .get(src_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].foursquare.getCategories + '/', {
            headers: {},
            params: {
                client_id: src_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].foursquare.clientId,
                client_secret: src_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].foursquare.clientSecret,
                v: this.getCurrentDate(),
            }
        });
    }
    getCurrentDate() {
        const dt = new Date();
        let month;
        let day;
        if (dt.getMonth.toString().length != 2) {
            month = '' + 0 + dt.getMonth();
        }
        else {
            month = dt.getMonth().toString();
        }
        if (dt.getDay.toString().length != 2) {
            day = '' + 0 + dt.getDay();
        }
        else {
            day = dt.getDay().toString();
        }
        return (dt.getFullYear().toString() + month + day);
    }
}
FoursquareService.ɵfac = function FoursquareService_Factory(t) { return new (t || FoursquareService)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"])); };
FoursquareService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: FoursquareService, factory: FoursquareService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](FoursquareService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"] }]; }, null); })();


/***/ }),

/***/ "QeH8":
/*!*******************************************************!*\
  !*** ./src/app/services/chatsystem/socket.service.ts ***!
  \*******************************************************/
/*! exports provided: SocketService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SocketService", function() { return SocketService; });
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/environments/environment */ "AytR");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var socket_io_client_dist_socket_io__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! socket.io-client/dist/socket.io */ "yd8o");
/* harmony import */ var socket_io_client_dist_socket_io__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(socket_io_client_dist_socket_io__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "qCKp");





class SocketService {
    constructor() {
        this.uri = src_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].travelnetURL;
        this.socket = socket_io_client_dist_socket_io__WEBPACK_IMPORTED_MODULE_2__(this.uri);
    }
    listen(eventName) {
        return new rxjs__WEBPACK_IMPORTED_MODULE_3__["Observable"]((sub) => {
            this.socket.on(eventName, (data) => {
                sub.next(data);
            });
        });
    }
    emitO(eventName, data) {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject();
            }
            else {
                this.socket.emit(eventName, data, (ack) => {
                    resolve(ack);
                });
            }
        });
    }
    emit(eventName, data, ack) {
        this.socket.emit(eventName, data, ack);
    }
    once(eventName) {
        return new rxjs__WEBPACK_IMPORTED_MODULE_3__["Observable"]((sub) => {
            this.socket.once(eventName, (data) => {
                sub.next(data);
            });
        });
    }
    remove(eventName) {
        this.socket.removeListener(eventName);
    }
    // disconnects and reconnects to backend
    close() {
        this.socket.close();
    }
    // permanent disconnection from backend
    disconnect() {
        this.socket.disconnect();
    }
    // manually reconnect to backend
    open() {
        this.socket.open();
    }
}
SocketService.ɵfac = function SocketService_Factory(t) { return new (t || SocketService)(); };
SocketService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: SocketService, factory: SocketService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](SocketService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "RnhZ":
/*!**************************************************!*\
  !*** ./node_modules/moment/locale sync ^\.\/.*$ ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./af": "K/tc",
	"./af.js": "K/tc",
	"./ar": "jnO4",
	"./ar-dz": "o1bE",
	"./ar-dz.js": "o1bE",
	"./ar-kw": "Qj4J",
	"./ar-kw.js": "Qj4J",
	"./ar-ly": "HP3h",
	"./ar-ly.js": "HP3h",
	"./ar-ma": "CoRJ",
	"./ar-ma.js": "CoRJ",
	"./ar-sa": "gjCT",
	"./ar-sa.js": "gjCT",
	"./ar-tn": "bYM6",
	"./ar-tn.js": "bYM6",
	"./ar.js": "jnO4",
	"./az": "SFxW",
	"./az.js": "SFxW",
	"./be": "H8ED",
	"./be.js": "H8ED",
	"./bg": "hKrs",
	"./bg.js": "hKrs",
	"./bm": "p/rL",
	"./bm.js": "p/rL",
	"./bn": "kEOa",
	"./bn.js": "kEOa",
	"./bo": "0mo+",
	"./bo.js": "0mo+",
	"./br": "aIdf",
	"./br.js": "aIdf",
	"./bs": "JVSJ",
	"./bs.js": "JVSJ",
	"./ca": "1xZ4",
	"./ca.js": "1xZ4",
	"./cs": "PA2r",
	"./cs.js": "PA2r",
	"./cv": "A+xa",
	"./cv.js": "A+xa",
	"./cy": "l5ep",
	"./cy.js": "l5ep",
	"./da": "DxQv",
	"./da.js": "DxQv",
	"./de": "tGlX",
	"./de-at": "s+uk",
	"./de-at.js": "s+uk",
	"./de-ch": "u3GI",
	"./de-ch.js": "u3GI",
	"./de.js": "tGlX",
	"./dv": "WYrj",
	"./dv.js": "WYrj",
	"./el": "jUeY",
	"./el.js": "jUeY",
	"./en-au": "Dmvi",
	"./en-au.js": "Dmvi",
	"./en-ca": "OIYi",
	"./en-ca.js": "OIYi",
	"./en-gb": "Oaa7",
	"./en-gb.js": "Oaa7",
	"./en-ie": "4dOw",
	"./en-ie.js": "4dOw",
	"./en-il": "czMo",
	"./en-il.js": "czMo",
	"./en-in": "7C5Q",
	"./en-in.js": "7C5Q",
	"./en-nz": "b1Dy",
	"./en-nz.js": "b1Dy",
	"./en-sg": "t+mt",
	"./en-sg.js": "t+mt",
	"./eo": "Zduo",
	"./eo.js": "Zduo",
	"./es": "iYuL",
	"./es-do": "CjzT",
	"./es-do.js": "CjzT",
	"./es-us": "Vclq",
	"./es-us.js": "Vclq",
	"./es.js": "iYuL",
	"./et": "7BjC",
	"./et.js": "7BjC",
	"./eu": "D/JM",
	"./eu.js": "D/JM",
	"./fa": "jfSC",
	"./fa.js": "jfSC",
	"./fi": "gekB",
	"./fi.js": "gekB",
	"./fil": "1ppg",
	"./fil.js": "1ppg",
	"./fo": "ByF4",
	"./fo.js": "ByF4",
	"./fr": "nyYc",
	"./fr-ca": "2fjn",
	"./fr-ca.js": "2fjn",
	"./fr-ch": "Dkky",
	"./fr-ch.js": "Dkky",
	"./fr.js": "nyYc",
	"./fy": "cRix",
	"./fy.js": "cRix",
	"./ga": "USCx",
	"./ga.js": "USCx",
	"./gd": "9rRi",
	"./gd.js": "9rRi",
	"./gl": "iEDd",
	"./gl.js": "iEDd",
	"./gom-deva": "qvJo",
	"./gom-deva.js": "qvJo",
	"./gom-latn": "DKr+",
	"./gom-latn.js": "DKr+",
	"./gu": "4MV3",
	"./gu.js": "4MV3",
	"./he": "x6pH",
	"./he.js": "x6pH",
	"./hi": "3E1r",
	"./hi.js": "3E1r",
	"./hr": "S6ln",
	"./hr.js": "S6ln",
	"./hu": "WxRl",
	"./hu.js": "WxRl",
	"./hy-am": "1rYy",
	"./hy-am.js": "1rYy",
	"./id": "UDhR",
	"./id.js": "UDhR",
	"./is": "BVg3",
	"./is.js": "BVg3",
	"./it": "bpih",
	"./it-ch": "bxKX",
	"./it-ch.js": "bxKX",
	"./it.js": "bpih",
	"./ja": "B55N",
	"./ja.js": "B55N",
	"./jv": "tUCv",
	"./jv.js": "tUCv",
	"./ka": "IBtZ",
	"./ka.js": "IBtZ",
	"./kk": "bXm7",
	"./kk.js": "bXm7",
	"./km": "6B0Y",
	"./km.js": "6B0Y",
	"./kn": "PpIw",
	"./kn.js": "PpIw",
	"./ko": "Ivi+",
	"./ko.js": "Ivi+",
	"./ku": "JCF/",
	"./ku.js": "JCF/",
	"./ky": "lgnt",
	"./ky.js": "lgnt",
	"./lb": "RAwQ",
	"./lb.js": "RAwQ",
	"./lo": "sp3z",
	"./lo.js": "sp3z",
	"./lt": "JvlW",
	"./lt.js": "JvlW",
	"./lv": "uXwI",
	"./lv.js": "uXwI",
	"./me": "KTz0",
	"./me.js": "KTz0",
	"./mi": "aIsn",
	"./mi.js": "aIsn",
	"./mk": "aQkU",
	"./mk.js": "aQkU",
	"./ml": "AvvY",
	"./ml.js": "AvvY",
	"./mn": "lYtQ",
	"./mn.js": "lYtQ",
	"./mr": "Ob0Z",
	"./mr.js": "Ob0Z",
	"./ms": "6+QB",
	"./ms-my": "ZAMP",
	"./ms-my.js": "ZAMP",
	"./ms.js": "6+QB",
	"./mt": "G0Uy",
	"./mt.js": "G0Uy",
	"./my": "honF",
	"./my.js": "honF",
	"./nb": "bOMt",
	"./nb.js": "bOMt",
	"./ne": "OjkT",
	"./ne.js": "OjkT",
	"./nl": "+s0g",
	"./nl-be": "2ykv",
	"./nl-be.js": "2ykv",
	"./nl.js": "+s0g",
	"./nn": "uEye",
	"./nn.js": "uEye",
	"./oc-lnc": "Fnuy",
	"./oc-lnc.js": "Fnuy",
	"./pa-in": "8/+R",
	"./pa-in.js": "8/+R",
	"./pl": "jVdC",
	"./pl.js": "jVdC",
	"./pt": "8mBD",
	"./pt-br": "0tRk",
	"./pt-br.js": "0tRk",
	"./pt.js": "8mBD",
	"./ro": "lyxo",
	"./ro.js": "lyxo",
	"./ru": "lXzo",
	"./ru.js": "lXzo",
	"./sd": "Z4QM",
	"./sd.js": "Z4QM",
	"./se": "//9w",
	"./se.js": "//9w",
	"./si": "7aV9",
	"./si.js": "7aV9",
	"./sk": "e+ae",
	"./sk.js": "e+ae",
	"./sl": "gVVK",
	"./sl.js": "gVVK",
	"./sq": "yPMs",
	"./sq.js": "yPMs",
	"./sr": "zx6S",
	"./sr-cyrl": "E+lV",
	"./sr-cyrl.js": "E+lV",
	"./sr.js": "zx6S",
	"./ss": "Ur1D",
	"./ss.js": "Ur1D",
	"./sv": "X709",
	"./sv.js": "X709",
	"./sw": "dNwA",
	"./sw.js": "dNwA",
	"./ta": "PeUW",
	"./ta.js": "PeUW",
	"./te": "XLvN",
	"./te.js": "XLvN",
	"./tet": "V2x9",
	"./tet.js": "V2x9",
	"./tg": "Oxv6",
	"./tg.js": "Oxv6",
	"./th": "EOgW",
	"./th.js": "EOgW",
	"./tk": "Wv91",
	"./tk.js": "Wv91",
	"./tl-ph": "Dzi0",
	"./tl-ph.js": "Dzi0",
	"./tlh": "z3Vd",
	"./tlh.js": "z3Vd",
	"./tr": "DoHr",
	"./tr.js": "DoHr",
	"./tzl": "z1FC",
	"./tzl.js": "z1FC",
	"./tzm": "wQk9",
	"./tzm-latn": "tT3J",
	"./tzm-latn.js": "tT3J",
	"./tzm.js": "wQk9",
	"./ug-cn": "YRex",
	"./ug-cn.js": "YRex",
	"./uk": "raLr",
	"./uk.js": "raLr",
	"./ur": "UpQW",
	"./ur.js": "UpQW",
	"./uz": "Loxo",
	"./uz-latn": "AQ68",
	"./uz-latn.js": "AQ68",
	"./uz.js": "Loxo",
	"./vi": "KSF8",
	"./vi.js": "KSF8",
	"./x-pseudo": "/X5v",
	"./x-pseudo.js": "/X5v",
	"./yo": "fzPg",
	"./yo.js": "fzPg",
	"./zh-cn": "XDpg",
	"./zh-cn.js": "XDpg",
	"./zh-hk": "SatO",
	"./zh-hk.js": "SatO",
	"./zh-mo": "OmwH",
	"./zh-mo.js": "OmwH",
	"./zh-tw": "kOpN",
	"./zh-tw.js": "kOpN"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "RnhZ";

/***/ }),

/***/ "STwT":
/*!************************************!*\
  !*** ./src/app/pipes/null.pipe.ts ***!
  \************************************/
/*! exports provided: NullPipe */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NullPipe", function() { return NullPipe; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");


class NullPipe {
    transform(value, parent = false, returnNull = false) {
        if (!parent.length) {
            return value;
        }
        else if (!parent) {
            if (returnNull) {
                return;
            }
            else {
                return 'no results found';
            }
        }
        else {
            if (value[parent[0]]) {
                return this.transform(value[parent.shift()], parent);
            }
            else {
                if (returnNull) {
                    return;
                }
                else {
                    return 'no results found';
                }
            }
        }
    }
}
NullPipe.ɵfac = function NullPipe_Factory(t) { return new (t || NullPipe)(); };
NullPipe.ɵpipe = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefinePipe"]({ name: "null", type: NullPipe, pure: true });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](NullPipe, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Pipe"],
        args: [{
                name: 'null'
            }]
    }], null, null); })();


/***/ }),

/***/ "Sy1n":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./services/chatsystem/friendlist.service */ "+7u6");
/* harmony import */ var _services_session_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./services/session.service */ "IfdK");
/* harmony import */ var src_app_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/services/chatsystem/socket.service */ "QeH8");
/* harmony import */ var _services_map_map_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./services/map/map.service */ "HYNq");
/* harmony import */ var _components_map_map_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/map/map.component */ "EZtS");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var _components_sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/sidebar/sidebar.component */ "zBoC");
/* harmony import */ var _components_header_header_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/header/header.component */ "2MiI");
/* harmony import */ var _components_chatsystem_chatsystem_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/chatsystem/chatsystem.component */ "25Q9");











class AppComponent {
    constructor(FriendlistService, SessionService, SocketService, MapService) {
        this.FriendlistService = FriendlistService;
        this.SessionService = SessionService;
        this.SocketService = SocketService;
        this.MapService = MapService;
        this.title = 'frontend';
        this.user = sessionStorage.getItem('username');
        // check if logged in from other tab (if LocalStorage exist)
        localStorage.getItem('username') ?
            this.SocketService.emit('updateLogin', { username: localStorage.getItem('username') }, (data) => {
                if (data.res) {
                    sessionStorage.setItem('username', data.res);
                    SessionService.session();
                }
                else if (data.err) {
                    console.log(data.err);
                    localStorage.clear();
                    sessionStorage.clear();
                    SessionService.session();
                }
            })
            : {};
        // calling observables
        this.openChatWidgetsSub = this.FriendlistService.openWidgets.subscribe(x => this.openChatWidgets = x);
        this.sessionStateSub = this.SessionService.sessionState.subscribe(x => {
            this.sessionState = x;
            if (this.sessionState) {
                // this.FriendlistService.getNotifications()
            }
        });
    }
    ngOnInit() {
        // this.FriendlistService.getNotifications()
    }
    ngDoCheck() {
        // console.log(this.sessionState)
    }
    resizeWindow() {
        this.windowHeight = window.innerHeight;
        this.FriendlistService.resizeWindow(window.innerWidth);
        this.MapService.getFakeCenter();
    }
    ngOnDestroy() {
        this.openChatWidgetsSub.unsubscribe();
        this.sessionStateSub.unsubscribe();
    }
}
AppComponent.ɵfac = function AppComponent_Factory(t) { return new (t || AppComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__["FriendlistService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_session_service__WEBPACK_IMPORTED_MODULE_2__["SessionService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_3__["SocketService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_map_map_service__WEBPACK_IMPORTED_MODULE_4__["MapService"])); };
AppComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: AppComponent, selectors: [["app-root"]], decls: 13, vars: 1, consts: [["lang", "en"], ["href", "https://api.mapbox.com/mapbox-gl-js/v1.8.1/mapbox-gl.css", "rel", "stylesheet"], [3, "resize"], [2, "z-index", "2", "position", "absolute", "top", "1%", "right", "1%"], ["id", "chatsystem"]], template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "html", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "head");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "title");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](3, "link", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "body", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("resize", function AppComponent_Template_body_resize_4_listener() { return ctx.resizeWindow(); }, false, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵresolveWindow"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](5, "app-map");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](6, "router-outlet");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](8, "app-sidebar");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](9, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](10, "header-navbar");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](12, "app-chatsystem");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵattribute"]("height", ctx.windowHeight);
    } }, directives: [_components_map_map_component__WEBPACK_IMPORTED_MODULE_5__["MapComponent"], _angular_router__WEBPACK_IMPORTED_MODULE_6__["RouterOutlet"], _components_sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_7__["SidebarComponent"], _components_header_header_component__WEBPACK_IMPORTED_MODULE_8__["HeaderComponent"], _components_chatsystem_chatsystem_component__WEBPACK_IMPORTED_MODULE_9__["ChatsystemComponent"]], styles: ["#titletab[_ngcontent-%COMP%] {\n  background-color: rgba(236, 115, 106, 0.836);\n  margin: 0;\n  font-family: \"Baloo Bhaina 2\", cursive;\n}\n\n#user[_ngcontent-%COMP%] {\n  max-width: 500px;\n  position: absolute;\n  margin: 0 10px 0 10px;\n  right: 0;\n  top: 0;\n}\n\n#title[_ngcontent-%COMP%] {\n  color: white;\n}\n\n#chatsystem[_ngcontent-%COMP%] {\n  z-index: 2;\n  right: 120px;\n  bottom: 10px;\n  position: absolute;\n}\n\n#head[_ngcontent-%COMP%] {\n  z-index: 1;\n  position: absolute;\n  top: 1px;\n  height: auto;\n}\n\nbutton[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n\nrouter-outlet[_ngcontent-%COMP%] {\n  z-index: 2;\n}\n\napp-map[_ngcontent-%COMP%] {\n  z-index: -1;\n}\n\nhtml[_ngcontent-%COMP%], body[_ngcontent-%COMP%] {\n  overflow-y: hidden !important;\n  overflow-x: hidden !important;\n  max-width: 100%;\n  max-height: 100vh;\n  max-height: 100vh !important;\n  height: 100vh !important;\n  height: 100vh;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcYXBwLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQ0ksNENBQUE7RUFDQSxTQUFBO0VBQ0Esc0NBQUE7QUFBSjs7QUFHQTtFQUNJLGdCQUFBO0VBQ0Esa0JBQUE7RUFDQSxxQkFBQTtFQUNBLFFBQUE7RUFDQSxNQUFBO0FBQUo7O0FBR0E7RUFDSSxZQUFBO0FBQUo7O0FBR0E7RUFDSSxVQUFBO0VBQ0EsWUFBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtBQUFKOztBQUdBO0VBRUksVUFBQTtFQUNBLGtCQUFBO0VBQ0EsUUFBQTtFQUNBLFlBQUE7QUFESjs7QUFJQTtFQUNJLGFBQUE7QUFESjs7QUFJQTtFQUVJLFVBQUE7QUFGSjs7QUFLQTtFQUNJLFdBQUE7QUFGSjs7QUFLQTtFQUNJLDZCQUFBO0VBQ0EsNkJBQUE7RUFDQSxlQUFBO0VBQ0EsaUJBQUE7RUFDQSw0QkFBQTtFQUNBLHdCQUFBO0VBQ0EsYUFBQTtBQUZKIiwiZmlsZSI6ImFwcC5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBpbXBvcnQgXCJ+QGFuZ3VsYXIvbWF0ZXJpYWwvcHJlYnVpbHQtdGhlbWVzL2luZGlnby1waW5rLmNzc1wiO1xyXG4jdGl0bGV0YWIge1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMzYsIDExNSwgMTA2LCAwLjgzNik7XHJcbiAgICBtYXJnaW46IDA7XHJcbiAgICBmb250LWZhbWlseTogJ0JhbG9vIEJoYWluYSAyJywgY3Vyc2l2ZTtcclxufVxyXG5cclxuI3VzZXIge1xyXG4gICAgbWF4LXdpZHRoOiA1MDBweDtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIG1hcmdpbjogMCAxMHB4IDAgMTBweDtcclxuICAgIHJpZ2h0OiAwO1xyXG4gICAgdG9wOjA7XHJcbn1cclxuXHJcbiN0aXRsZSB7XHJcbiAgICBjb2xvcjogd2hpdGU7XHJcbn1cclxuXHJcbiNjaGF0c3lzdGVtIHtcclxuICAgIHotaW5kZXg6IDI7XHJcbiAgICByaWdodDogMTIwcHg7XHJcbiAgICBib3R0b206IDEwcHg7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbn1cclxuXHJcbiNoZWFkIHtcclxuICAgIC8vIHBhZGRpbmc6IDElO1xyXG4gICAgei1pbmRleDogMTtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIHRvcDogMXB4O1xyXG4gICAgaGVpZ2h0OiBhdXRvO1xyXG59XHJcblxyXG5idXR0b246Zm9jdXMge1xyXG4gICAgb3V0bGluZTogbm9uZTtcclxufVxyXG5cclxucm91dGVyLW91dGxldCB7XHJcbiAgICAvLyBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICB6LWluZGV4OiAyO1xyXG59XHJcblxyXG5hcHAtbWFwIHtcclxuICAgIHotaW5kZXg6IC0xO1xyXG59XHJcblxyXG5odG1sLCBib2R5IHtcclxuICAgIG92ZXJmbG93LXk6IGhpZGRlbiAhaW1wb3J0YW50O1xyXG4gICAgb3ZlcmZsb3cteDogaGlkZGVuICFpbXBvcnRhbnQ7XHJcbiAgICBtYXgtd2lkdGg6IDEwMCU7XHJcbiAgICBtYXgtaGVpZ2h0OiAxMDB2aDtcclxuICAgIG1heC1oZWlnaHQ6IDEwMHZoICFpbXBvcnRhbnQ7XHJcbiAgICBoZWlnaHQ6IDEwMHZoICFpbXBvcnRhbnQ7XHJcbiAgICBoZWlnaHQ6IDEwMHZoO1xyXG59XHJcbiJdfQ== */", "@import url('https://fonts.googleapis.com/css2?family=Baloo+Bhaina+2&display=swap');"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AppComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-root',
                templateUrl: './app.component.html',
                styleUrls: ['./app.component.scss']
            }]
    }], function () { return [{ type: _services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__["FriendlistService"] }, { type: _services_session_service__WEBPACK_IMPORTED_MODULE_2__["SessionService"] }, { type: src_app_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_3__["SocketService"] }, { type: _services_map_map_service__WEBPACK_IMPORTED_MODULE_4__["MapService"] }]; }, null); })();


/***/ }),

/***/ "Tvdm":
/*!**********************************************!*\
  !*** ./src/app/services/comments.service.ts ***!
  \**********************************************/
/*! exports provided: CommentsService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CommentsService", function() { return CommentsService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/environments/environment */ "AytR");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common/http */ "IheW");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var _add_post_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./add-post.service */ "woXb");








class CommentsService {
    constructor(http, router, PostService) {
        this.http = http;
        this.router = router;
        this.PostService = PostService;
        this.url = src_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].travelnet.travelnetCommentURL;
        this.posts = [];
        this.postsUpdated = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
    }
    addComment(newComment, postId) {
        this.http
            .post(this.url, { commentData: newComment, postId }, {
            headers: {}
        }).subscribe(responseData => {
            const comment = {
                _id: responseData.comment._id,
                date: responseData.comment.date,
                author: responseData.comment.author,
                likes: responseData.comment.likes,
                content: newComment.content,
                replies: responseData.comment.replies,
                edited: responseData.comment.edited,
            };
            console.log(comment);
            // need to update post
            const postIndex = this.PostService.posts.findIndex(p => p._id === postId);
            this.PostService.posts[postIndex].comments.push(comment);
            this.PostService.updatePosts(this.PostService.posts);
        });
    }
    /**get all comments associated to a post*/
    getComments() {
        this.http
            .get(this.url)
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["map"])(commentData => {
            return commentData.comments.map(comment => {
                return {
                    _id: comment._id,
                    date: comment.date,
                    author: comment.author,
                    content: comment.content,
                    likes: comment.likes,
                    replies: comment.replies,
                    edited: comment.edited
                };
            });
        }))
            .subscribe(transformedComments => {
            // this.posts = transformedPosts;
            // this.postsUpdated.next([...this.posts])/;
        });
    }
    // doesnt even exist lul
    /**get specific comment given its id */
    getComment(commentId) {
        return this.http.get(this.url + commentId);
    }
    /**reply to head comment */
    reply(replyContent) {
        const postIndex = this.PostService.posts.findIndex(p => p._id === replyContent.postId);
        const commentIndex = this.PostService.posts[postIndex].comments.findIndex(c => c._id === replyContent.commentId);
        this.http
            .put(this.url + replyContent.commentId, { commentData: replyContent.reply, postId: replyContent.postId })
            .subscribe(responseData => {
            this.PostService.posts[postIndex].comments[commentIndex].replies.push(responseData.reply);
            this.PostService.updatePosts(this.PostService.posts);
        });
    }
    /**edit  tree comment */
    editComment(editContent) {
        console.log(editContent);
        const postIndex = this.PostService.posts.findIndex(p => p._id === editContent.postId);
        const commentIndex = this.PostService.posts[postIndex].comments.findIndex(c => c._id === editContent.comment._id);
        if (editContent.reply) {
            const replyIndex = this.PostService.posts[postIndex].comments[commentIndex].replies.findIndex(r => r._id === editContent.reply._id);
        }
        this.http
            .put(this.url + 'edit/' + editContent.comment._id, { postId: editContent.postId, replyId: editContent.reply, comment: editContent.comment })
            .subscribe(response => {
            (this.PostService.posts[postIndex]).comments[commentIndex] = response.comment;
            this.PostService.updatePost(this.PostService.posts);
        });
    }
    /**like comment */
    likeComment(likeContent) {
        const postIndex = this.PostService.posts.findIndex(p => p._id === likeContent.postId);
        const commentIndex = this.PostService.posts[postIndex].comments.findIndex(c => c._id === likeContent.commentId);
        let replyIndex;
        if (likeContent.replyId) {
            const replyIndex = this.PostService.posts[postIndex].comments[commentIndex].replies.findIndex(r => r._id === likeContent.replyId);
        }
        this.http
            .put(this.url + 'like/' + likeContent.commentId, { postId: likeContent.postId, username: likeContent.username, replyId: likeContent.replyId })
            .subscribe(response => {
            if (likeContent.replyId) {
                (this.PostService.posts[postIndex]).comments[commentIndex].replies[replyIndex].likes = response.likes;
            }
            else {
                (this.PostService.posts[postIndex]).comments[commentIndex].likes = response.likes;
            }
            this.PostService.updatePost(this.PostService.posts);
        });
    }
    /**delete existing comment */
    deleteComment(deleteContent) {
        const postIndex = this.PostService.posts.findIndex(p => p._id === deleteContent.postId);
        const commentIndex = this.PostService.posts[postIndex].comments.findIndex(c => c._id === deleteContent.commentId);
        let replyIndex;
        if (deleteContent.replyId) {
            const replyIndex = this.PostService.posts[postIndex].comments[commentIndex].replies.findIndex(r => r._id === deleteContent.replyId);
        }
        this.http
            .put(this.url + 'delete/' + deleteContent.commentId, { postId: deleteContent.postId, replyId: deleteContent.replyId })
            .subscribe(() => {
            const newPosts = this.PostService.posts;
            if (deleteContent.replyId) {
                newPosts[postIndex].comments[commentIndex].replies.splice(replyIndex);
            }
            else {
                newPosts[postIndex].comments.splice(commentIndex);
            }
            this.postsUpdated.next(newPosts);
        });
    }
}
CommentsService.ɵfac = function CommentsService_Factory(t) { return new (t || CommentsService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_4__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_add_post_service__WEBPACK_IMPORTED_MODULE_6__["AddPostService"])); };
CommentsService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: CommentsService, factory: CommentsService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](CommentsService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_4__["HttpClient"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"] }, { type: _add_post_service__WEBPACK_IMPORTED_MODULE_6__["AddPostService"] }]; }, null); })();


/***/ }),

/***/ "VDfD":
/*!*****************************************************************************!*\
  !*** ./src/app/components/sidebar/scroll-to-top/scroll-to-top.component.ts ***!
  \*****************************************************************************/
/*! exports provided: ScrollToTopComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ScrollToTopComponent", function() { return ScrollToTopComponent; });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");






class ScrollToTopComponent {
    constructor() { }
    ngOnInit() {
    }
    scrollToTop() {
        const duration = 500;
        const interval = 40;
        const move = this.el.scrollTop * interval / duration;
        Object(rxjs__WEBPACK_IMPORTED_MODULE_0__["interval"])(interval)
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["scan"])((acc, curr) => acc - move, this.el.scrollTop), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])(position => this.el.scrollTop = position), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["takeWhile"])(val => val > 0))
            .subscribe();
    }
}
ScrollToTopComponent.ɵfac = function ScrollToTopComponent_Factory(t) { return new (t || ScrollToTopComponent)(); };
ScrollToTopComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({ type: ScrollToTopComponent, selectors: [["app-scroll-to-top"]], inputs: { el: "el" }, decls: 3, vars: 0, consts: [["mat-raised-button", "", "color", "primary", 3, "click"]], template: function ScrollToTopComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "button", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function ScrollToTopComponent_Template_button_click_0_listener() { return ctx.scrollToTop(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "mat-icon");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](2, "keyboard_arrow_up");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    } }, directives: [_angular_material_button__WEBPACK_IMPORTED_MODULE_3__["MatButton"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_4__["MatIcon"]], styles: ["button[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFwuLlxcc2Nyb2xsLXRvLXRvcC5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLGFBQUE7QUFDSiIsImZpbGUiOiJzY3JvbGwtdG8tdG9wLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiYnV0dG9uOmZvY3VzIHtcclxuICAgIG91dGxpbmU6IG5vbmU7XHJcbn0iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵsetClassMetadata"](ScrollToTopComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_2__["Component"],
        args: [{
                selector: 'app-scroll-to-top',
                templateUrl: './scroll-to-top.component.html',
                styleUrls: ['./scroll-to-top.component.scss']
            }]
    }], function () { return []; }, { el: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_2__["Input"]
        }] }); })();


/***/ }),

/***/ "VX6k":
/*!**************************************!*\
  !*** ./src/app/models/trip.model.ts ***!
  \**************************************/
/*! exports provided: tripModel */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tripModel", function() { return tripModel; });
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! moment */ "wd/R");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_0__);

class tripModel {
    constructor(start, end, name, isPrivate) {
        const final = moment__WEBPACK_IMPORTED_MODULE_0__(end);
        this.tripName = name;
        this.dateRange = {
            start,
            end,
            length: final.diff(start, 'days') + 1
        };
        this.schedule = [];
        for (let x = 0; x < this.dateRange.length; x++) {
            this.schedule.push({
                day: moment__WEBPACK_IMPORTED_MODULE_0__(start).add(x, 'days').toDate(),
                venues: []
            });
        }
        this.isPrivate = isPrivate ? isPrivate : false;
    }
}


/***/ }),

/***/ "W524":
/*!******************************************!*\
  !*** ./src/app/services/trip.service.ts ***!
  \******************************************/
/*! exports provided: TripService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TripService", function() { return TripService; });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _http_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./http.service */ "N+K7");
/* harmony import */ var src_app_services_session_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/services/session.service */ "IfdK");





class TripService {
    constructor(HttpService, SessionService) {
        this.HttpService = HttpService;
        this.SessionService = SessionService;
        this.sessionState = this.SessionService.session();
        // query settings from mytrip add venue
        this.searchedVenue = null;
        this._trips = new rxjs__WEBPACK_IMPORTED_MODULE_0__["BehaviorSubject"](null);
        this.trips = this._trips.asObservable();
        // check if user is logged in and retrieve trip data
        this.sessionState_sub = this.SessionService.sessionState.subscribe((state) => {
            if (state) {
                this.sessionState = state;
                this.HttpService.get('/user', {})
                    .then((response) => {
                    if (response.user) {
                        this._trips.next(response.user[0].trips);
                    }
                })
                    .catch(err => {
                    console.log(err);
                });
            }
        });
    }
    /** when user searches/finished searching a venue from mytrip -> add venue */
    changeQuery(query) {
        this.searchedVenue = query;
    }
    /** modifies trips of user */
    modifyBackend(triparr) {
        return new Promise((resolve, reject) => {
            this.HttpService.patch('/user/edit', {
                username: localStorage.getItem('username'),
                proprety: 'trips',
                newProprety: triparr
            })
                .then((response) => {
                this._trips.next(triparr);
                resolve(response);
            })
                .catch(err => {
                reject(err);
            });
        });
    }
    /**localy update trips of user (when modification is already done)*/
    updateLocal(triparr) {
        this._trips.next(triparr);
    }
    ngOnDestroy() {
        this.sessionState_sub.unsubscribe();
    }
}
TripService.ɵfac = function TripService_Factory(t) { return new (t || TripService)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_http_service__WEBPACK_IMPORTED_MODULE_2__["HttpService"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](src_app_services_session_service__WEBPACK_IMPORTED_MODULE_3__["SessionService"])); };
TripService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: TripService, factory: TripService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](TripService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _http_service__WEBPACK_IMPORTED_MODULE_2__["HttpService"] }, { type: src_app_services_session_service__WEBPACK_IMPORTED_MODULE_3__["SessionService"] }]; }, null); })();


/***/ }),

/***/ "ZAI4":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/common/http */ "IheW");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser */ "cUpR");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./app-routing.module */ "vY5A");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./app.component */ "Sy1n");
/* harmony import */ var _components_registration_process_registrationpage_registrationpage_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/registration-process/registrationpage/registrationpage.component */ "ijTB");
/* harmony import */ var _components_loginpage_loginpage_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/loginpage/loginpage.component */ "O3zK");
/* harmony import */ var _components_logout_logout_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/logout/logout.component */ "aer8");
/* harmony import */ var _components_chatsystem_chatwidget_chatwidget_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/chatsystem/chatwidget/chatwidget.component */ "lumE");
/* harmony import */ var _components_chatsystem_friendlist_friendlist_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./components/chatsystem/friendlist/friendlist.component */ "Awxy");
/* harmony import */ var _components_header_header_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./components/header/header.component */ "2MiI");
/* harmony import */ var _components_chatsystem_friendlist_friend_friend_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./components/chatsystem/friendlist/friend/friend.component */ "2HSR");
/* harmony import */ var _components_map_map_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./components/map/map.component */ "EZtS");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "G0yt");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _components_chatsystem_chatsystem_component__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./components/chatsystem/chatsystem.component */ "25Q9");
/* harmony import */ var _components_sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./components/sidebar/sidebar.component */ "zBoC");
/* harmony import */ var _components_profile_profile_component__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./components/profile/profile.component */ "DZ0t");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/platform-browser/animations */ "omvX");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/material/input */ "e6WT");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");
/* harmony import */ var _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/checkbox */ "pMoy");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _components_profile_proprety_proprety_component__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./components/profile/proprety/proprety.component */ "7A62");
/* harmony import */ var _angular_material_radio__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @angular/material/radio */ "zQhy");
/* harmony import */ var angular_resizable_element__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! angular-resizable-element */ "yotz");
/* harmony import */ var _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! @angular/material/autocomplete */ "vrAh");
/* harmony import */ var _angular_material_badge__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! @angular/material/badge */ "8Qe2");
/* harmony import */ var _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! @angular/material/bottom-sheet */ "Km1n");
/* harmony import */ var _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! @angular/material/button-toggle */ "Ynp+");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! @angular/material/card */ "PDjf");
/* harmony import */ var _angular_material_chips__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! @angular/material/chips */ "f44v");
/* harmony import */ var _angular_material_stepper__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! @angular/material/stepper */ "hzfI");
/* harmony import */ var _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! @angular/material/datepicker */ "TN/R");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! @angular/material/dialog */ "iELJ");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! @angular/material/divider */ "BSbQ");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! @angular/material/expansion */ "o4Yh");
/* harmony import */ var _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! @angular/material/grid-list */ "40+f");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! @angular/material/list */ "SqCe");
/* harmony import */ var _angular_material_menu__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! @angular/material/menu */ "rJgo");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! @angular/material/core */ "UhP/");
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! @angular/material/paginator */ "5QHs");
/* harmony import */ var _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! @angular/material/progress-bar */ "BTe0");
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! @angular/material/progress-spinner */ "pu8Q");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! @angular/material/select */ "ZTz/");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! @angular/material/sidenav */ "q7Ft");
/* harmony import */ var _angular_material_slider__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! @angular/material/slider */ "mPVK");
/* harmony import */ var _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! @angular/material/slide-toggle */ "jMqV");
/* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! @angular/material/snack-bar */ "zHaW");
/* harmony import */ var _angular_material_sort__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! @angular/material/sort */ "LUZP");
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! @angular/material/table */ "OaSA");
/* harmony import */ var _angular_material_tabs__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(/*! @angular/material/tabs */ "M9ds");
/* harmony import */ var _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(/*! @angular/material/toolbar */ "l0rg");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_55__ = __webpack_require__(/*! @angular/material/tooltip */ "ZFy/");
/* harmony import */ var _angular_material_tree__WEBPACK_IMPORTED_MODULE_56__ = __webpack_require__(/*! @angular/material/tree */ "OLiY");
/* harmony import */ var _components_registration_process_registration_process_component__WEBPACK_IMPORTED_MODULE_57__ = __webpack_require__(/*! ./components/registration-process/registration-process.component */ "OlRB");
/* harmony import */ var _components_tabs_searchresults_searchresults_component__WEBPACK_IMPORTED_MODULE_58__ = __webpack_require__(/*! ./components/tabs/searchresults/searchresults.component */ "a1cW");
/* harmony import */ var _components_tabs_home_home_component__WEBPACK_IMPORTED_MODULE_59__ = __webpack_require__(/*! ./components/tabs/home/home.component */ "mqv/");
/* harmony import */ var _components_myaccount_myaccount_component__WEBPACK_IMPORTED_MODULE_60__ = __webpack_require__(/*! ./components/myaccount/myaccount.component */ "AKBL");
/* harmony import */ var _components_tabs_mytrip_mytrip_component__WEBPACK_IMPORTED_MODULE_61__ = __webpack_require__(/*! ./components/tabs/mytrip/mytrip.component */ "/mFC");
/* harmony import */ var _components_registration_process_country_selector_country_selector_component__WEBPACK_IMPORTED_MODULE_62__ = __webpack_require__(/*! ./components/registration-process/country-selector/country-selector.component */ "AALG");
/* harmony import */ var _components_tabs_searchresults_VenueButton_VenueButton_component__WEBPACK_IMPORTED_MODULE_63__ = __webpack_require__(/*! ./components/tabs/searchresults/VenueButton/VenueButton.component */ "PAeE");
/* harmony import */ var _components_tabs_mytrip_tripmodal_tripmodal_component__WEBPACK_IMPORTED_MODULE_64__ = __webpack_require__(/*! ./components/tabs/mytrip/tripmodal/tripmodal.component */ "bDK8");
/* harmony import */ var _components_venue_venue_component__WEBPACK_IMPORTED_MODULE_65__ = __webpack_require__(/*! ./components/venue/venue.component */ "Bg0t");
/* harmony import */ var _components_search_bar_search_bar_component__WEBPACK_IMPORTED_MODULE_66__ = __webpack_require__(/*! ./components/search-bar/search-bar.component */ "lCy9");
/* harmony import */ var _pipes_list_object_pipe__WEBPACK_IMPORTED_MODULE_67__ = __webpack_require__(/*! ./pipes/list-object.pipe */ "hZyq");
/* harmony import */ var _pipes_null_pipe__WEBPACK_IMPORTED_MODULE_68__ = __webpack_require__(/*! ./pipes/null.pipe */ "STwT");
/* harmony import */ var _components_userprofile_userprofile_component__WEBPACK_IMPORTED_MODULE_69__ = __webpack_require__(/*! ./components/userprofile/userprofile.component */ "P1Wc");
/* harmony import */ var _components_tabs_searchresults_userbutton_userbutton_component__WEBPACK_IMPORTED_MODULE_70__ = __webpack_require__(/*! ./components/tabs/searchresults/userbutton/userbutton.component */ "LdkP");
/* harmony import */ var _components_tabs_mytrip_add_venue_popover_add_venue_popover_component__WEBPACK_IMPORTED_MODULE_71__ = __webpack_require__(/*! ./components/tabs/mytrip/add-venue-popover/add-venue-popover.component */ "HSUS");
/* harmony import */ var _components_city_search_city_search_component__WEBPACK_IMPORTED_MODULE_72__ = __webpack_require__(/*! ./components/city-search/city-search.component */ "tuAr");
/* harmony import */ var _components_filter_filter_component__WEBPACK_IMPORTED_MODULE_73__ = __webpack_require__(/*! ./components/filter/filter.component */ "/J2p");
/* harmony import */ var _components_sidebar_scroll_to_top_scroll_to_top_component__WEBPACK_IMPORTED_MODULE_74__ = __webpack_require__(/*! ./components/sidebar/scroll-to-top/scroll-to-top.component */ "VDfD");
/* harmony import */ var _components_add_post_add_post_component__WEBPACK_IMPORTED_MODULE_75__ = __webpack_require__(/*! ./components/add-post/add-post.component */ "qF1r");
/* harmony import */ var _components_display_posts_display_posts_component__WEBPACK_IMPORTED_MODULE_76__ = __webpack_require__(/*! ./components/display-posts/display-posts.component */ "D4op");
/* harmony import */ var _components_comment_section_comment_section_component__WEBPACK_IMPORTED_MODULE_77__ = __webpack_require__(/*! ./components/comment-section/comment-section.component */ "hihI");
/* harmony import */ var _components_comment_comment_component__WEBPACK_IMPORTED_MODULE_78__ = __webpack_require__(/*! ./components/comment/comment.component */ "fGHt");
/* harmony import */ var _components_tabs_searchresults_add_to_trip_popover_add_to_trip_popover_component__WEBPACK_IMPORTED_MODULE_79__ = __webpack_require__(/*! ./components/tabs/searchresults/add-to-trip-popover/add-to-trip-popover.component */ "JVKH");
/* harmony import */ var _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_80__ = __webpack_require__(/*! @angular/cdk/drag-drop */ "ltgo");
/* harmony import */ var _pipes_array_to_pipe_pipe__WEBPACK_IMPORTED_MODULE_81__ = __webpack_require__(/*! ./pipes/array-to-pipe.pipe */ "Edcf");
/* harmony import */ var _components_edit_comment_edit_comment_component__WEBPACK_IMPORTED_MODULE_82__ = __webpack_require__(/*! ./components/edit-comment/edit-comment.component */ "OM0W");
/* harmony import */ var _components_share_share_component__WEBPACK_IMPORTED_MODULE_83__ = __webpack_require__(/*! ./components/share/share.component */ "5ghV");
/* harmony import */ var _angular_cdk_clipboard__WEBPACK_IMPORTED_MODULE_84__ = __webpack_require__(/*! @angular/cdk/clipboard */ "Tr4x");
/* harmony import */ var _components_search_posts_search_posts_component__WEBPACK_IMPORTED_MODULE_85__ = __webpack_require__(/*! ./components/search-posts/search-posts.component */ "3AFk");
/* harmony import */ var _components_add_tag_add_tag_component__WEBPACK_IMPORTED_MODULE_86__ = __webpack_require__(/*! ./components/add-tag/add-tag.component */ "4eJP");

























































































class AppModule {
}
AppModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineNgModule"]({ type: AppModule, bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_5__["AppComponent"]] });
AppModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjector"]({ factory: function AppModule_Factory(t) { return new (t || AppModule)(); }, providers: [], imports: [[
            _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__["BrowserModule"],
            _app_routing_module__WEBPACK_IMPORTED_MODULE_4__["AppRoutingModule"],
            _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormsModule"],
            _angular_forms__WEBPACK_IMPORTED_MODULE_3__["ReactiveFormsModule"],
            _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_15__["RxReactiveFormsModule"],
            _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_14__["NgbModule"],
            _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_19__["BrowserAnimationsModule"],
            _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__["MatFormFieldModule"],
            _angular_material_input__WEBPACK_IMPORTED_MODULE_21__["MatInputModule"],
            _angular_material_icon__WEBPACK_IMPORTED_MODULE_22__["MatIconModule"],
            _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_23__["MatCheckboxModule"],
            _angular_material_button__WEBPACK_IMPORTED_MODULE_24__["MatButtonModule"],
            _angular_material_radio__WEBPACK_IMPORTED_MODULE_26__["MatRadioModule"],
            angular_resizable_element__WEBPACK_IMPORTED_MODULE_27__["ResizableModule"],
            _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_28__["MatAutocompleteModule"],
            _angular_material_badge__WEBPACK_IMPORTED_MODULE_29__["MatBadgeModule"],
            _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_30__["MatBottomSheetModule"],
            _angular_material_button__WEBPACK_IMPORTED_MODULE_24__["MatButtonModule"],
            _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_31__["MatButtonToggleModule"],
            _angular_material_card__WEBPACK_IMPORTED_MODULE_32__["MatCardModule"],
            _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_23__["MatCheckboxModule"],
            _angular_material_chips__WEBPACK_IMPORTED_MODULE_33__["MatChipsModule"],
            _angular_material_stepper__WEBPACK_IMPORTED_MODULE_34__["MatStepperModule"],
            _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_35__["MatDatepickerModule"],
            _angular_material_dialog__WEBPACK_IMPORTED_MODULE_36__["MatDialogModule"],
            _angular_material_divider__WEBPACK_IMPORTED_MODULE_37__["MatDividerModule"],
            _angular_material_expansion__WEBPACK_IMPORTED_MODULE_38__["MatExpansionModule"],
            _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_39__["MatGridListModule"],
            _angular_material_icon__WEBPACK_IMPORTED_MODULE_22__["MatIconModule"],
            _angular_material_input__WEBPACK_IMPORTED_MODULE_21__["MatInputModule"],
            _angular_material_list__WEBPACK_IMPORTED_MODULE_40__["MatListModule"],
            _angular_material_menu__WEBPACK_IMPORTED_MODULE_41__["MatMenuModule"],
            _angular_material_core__WEBPACK_IMPORTED_MODULE_42__["MatNativeDateModule"],
            _angular_material_paginator__WEBPACK_IMPORTED_MODULE_43__["MatPaginatorModule"],
            _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_44__["MatProgressBarModule"],
            _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_45__["MatProgressSpinnerModule"],
            _angular_material_radio__WEBPACK_IMPORTED_MODULE_26__["MatRadioModule"],
            _angular_material_core__WEBPACK_IMPORTED_MODULE_42__["MatRippleModule"],
            _angular_material_select__WEBPACK_IMPORTED_MODULE_46__["MatSelectModule"],
            _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_47__["MatSidenavModule"],
            _angular_material_slider__WEBPACK_IMPORTED_MODULE_48__["MatSliderModule"],
            _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_49__["MatSlideToggleModule"],
            _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_50__["MatSnackBarModule"],
            _angular_material_sort__WEBPACK_IMPORTED_MODULE_51__["MatSortModule"],
            _angular_material_table__WEBPACK_IMPORTED_MODULE_52__["MatTableModule"],
            _angular_material_tabs__WEBPACK_IMPORTED_MODULE_53__["MatTabsModule"],
            _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_54__["MatToolbarModule"],
            _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_55__["MatTooltipModule"],
            _angular_material_tree__WEBPACK_IMPORTED_MODULE_56__["MatTreeModule"],
            _angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpClientModule"],
            _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_80__["DragDropModule"],
            _angular_cdk_clipboard__WEBPACK_IMPORTED_MODULE_84__["ClipboardModule"]
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵsetNgModuleScope"](AppModule, { declarations: [_app_component__WEBPACK_IMPORTED_MODULE_5__["AppComponent"],
        _components_registration_process_registrationpage_registrationpage_component__WEBPACK_IMPORTED_MODULE_6__["RegistrationComponent"],
        _components_loginpage_loginpage_component__WEBPACK_IMPORTED_MODULE_7__["LoginComponent"],
        _components_logout_logout_component__WEBPACK_IMPORTED_MODULE_8__["LogoutComponent"],
        _components_chatsystem_chatwidget_chatwidget_component__WEBPACK_IMPORTED_MODULE_9__["ChatwidgetComponent"],
        _components_chatsystem_friendlist_friendlist_component__WEBPACK_IMPORTED_MODULE_10__["FriendlistComponent"],
        _components_header_header_component__WEBPACK_IMPORTED_MODULE_11__["HeaderComponent"],
        _components_chatsystem_friendlist_friend_friend_component__WEBPACK_IMPORTED_MODULE_12__["FriendComponent"],
        _components_map_map_component__WEBPACK_IMPORTED_MODULE_13__["MapComponent"],
        _components_loginpage_loginpage_component__WEBPACK_IMPORTED_MODULE_7__["loginComponent"],
        _components_chatsystem_chatsystem_component__WEBPACK_IMPORTED_MODULE_16__["ChatsystemComponent"],
        _components_sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_17__["SidebarComponent"],
        _components_profile_profile_component__WEBPACK_IMPORTED_MODULE_18__["ProfileComponent"],
        _components_profile_proprety_proprety_component__WEBPACK_IMPORTED_MODULE_25__["PropretyComponent"],
        _components_registration_process_registration_process_component__WEBPACK_IMPORTED_MODULE_57__["RegistrationProcessComponent"],
        _components_tabs_searchresults_searchresults_component__WEBPACK_IMPORTED_MODULE_58__["SearchresultsComponent"],
        _components_tabs_home_home_component__WEBPACK_IMPORTED_MODULE_59__["HomeComponent"],
        _components_myaccount_myaccount_component__WEBPACK_IMPORTED_MODULE_60__["MyaccountComponent"],
        _components_tabs_mytrip_mytrip_component__WEBPACK_IMPORTED_MODULE_61__["MytripComponent"],
        _components_registration_process_country_selector_country_selector_component__WEBPACK_IMPORTED_MODULE_62__["CountrySelectorComponent"],
        _components_tabs_searchresults_VenueButton_VenueButton_component__WEBPACK_IMPORTED_MODULE_63__["VenueButtonComponent"],
        _components_tabs_mytrip_tripmodal_tripmodal_component__WEBPACK_IMPORTED_MODULE_64__["TripmodalComponent"],
        _components_venue_venue_component__WEBPACK_IMPORTED_MODULE_65__["VenueComponent"],
        _components_search_bar_search_bar_component__WEBPACK_IMPORTED_MODULE_66__["SearchBarComponent"],
        _pipes_list_object_pipe__WEBPACK_IMPORTED_MODULE_67__["ListObjectPipe"],
        _pipes_null_pipe__WEBPACK_IMPORTED_MODULE_68__["NullPipe"],
        _components_userprofile_userprofile_component__WEBPACK_IMPORTED_MODULE_69__["UserprofileComponent"],
        _components_tabs_searchresults_userbutton_userbutton_component__WEBPACK_IMPORTED_MODULE_70__["UserbuttonComponent"],
        _components_tabs_mytrip_add_venue_popover_add_venue_popover_component__WEBPACK_IMPORTED_MODULE_71__["AddVenuePopoverComponent"],
        _components_city_search_city_search_component__WEBPACK_IMPORTED_MODULE_72__["CitySearchComponent"],
        _components_filter_filter_component__WEBPACK_IMPORTED_MODULE_73__["FilterComponent"],
        _components_sidebar_scroll_to_top_scroll_to_top_component__WEBPACK_IMPORTED_MODULE_74__["ScrollToTopComponent"],
        _components_add_post_add_post_component__WEBPACK_IMPORTED_MODULE_75__["AddPostComponent"],
        _components_display_posts_display_posts_component__WEBPACK_IMPORTED_MODULE_76__["DisplayPostsComponent"],
        _components_comment_section_comment_section_component__WEBPACK_IMPORTED_MODULE_77__["CommentSectionComponent"],
        _components_comment_comment_component__WEBPACK_IMPORTED_MODULE_78__["CommentComponent"],
        _components_tabs_searchresults_add_to_trip_popover_add_to_trip_popover_component__WEBPACK_IMPORTED_MODULE_79__["AddToTripPopoverComponent"],
        _pipes_array_to_pipe_pipe__WEBPACK_IMPORTED_MODULE_81__["ArrayToPipePipe"],
        _components_edit_comment_edit_comment_component__WEBPACK_IMPORTED_MODULE_82__["EditCommentComponent"],
        _components_share_share_component__WEBPACK_IMPORTED_MODULE_83__["ShareComponent"],
        _components_search_posts_search_posts_component__WEBPACK_IMPORTED_MODULE_85__["SearchPostsComponent"],
        _components_add_tag_add_tag_component__WEBPACK_IMPORTED_MODULE_86__["AddTagComponent"]], imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__["BrowserModule"],
        _app_routing_module__WEBPACK_IMPORTED_MODULE_4__["AppRoutingModule"],
        _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormsModule"],
        _angular_forms__WEBPACK_IMPORTED_MODULE_3__["ReactiveFormsModule"],
        _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_15__["RxReactiveFormsModule"],
        _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_14__["NgbModule"],
        _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_19__["BrowserAnimationsModule"],
        _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__["MatFormFieldModule"],
        _angular_material_input__WEBPACK_IMPORTED_MODULE_21__["MatInputModule"],
        _angular_material_icon__WEBPACK_IMPORTED_MODULE_22__["MatIconModule"],
        _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_23__["MatCheckboxModule"],
        _angular_material_button__WEBPACK_IMPORTED_MODULE_24__["MatButtonModule"],
        _angular_material_radio__WEBPACK_IMPORTED_MODULE_26__["MatRadioModule"],
        angular_resizable_element__WEBPACK_IMPORTED_MODULE_27__["ResizableModule"],
        _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_28__["MatAutocompleteModule"],
        _angular_material_badge__WEBPACK_IMPORTED_MODULE_29__["MatBadgeModule"],
        _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_30__["MatBottomSheetModule"],
        _angular_material_button__WEBPACK_IMPORTED_MODULE_24__["MatButtonModule"],
        _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_31__["MatButtonToggleModule"],
        _angular_material_card__WEBPACK_IMPORTED_MODULE_32__["MatCardModule"],
        _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_23__["MatCheckboxModule"],
        _angular_material_chips__WEBPACK_IMPORTED_MODULE_33__["MatChipsModule"],
        _angular_material_stepper__WEBPACK_IMPORTED_MODULE_34__["MatStepperModule"],
        _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_35__["MatDatepickerModule"],
        _angular_material_dialog__WEBPACK_IMPORTED_MODULE_36__["MatDialogModule"],
        _angular_material_divider__WEBPACK_IMPORTED_MODULE_37__["MatDividerModule"],
        _angular_material_expansion__WEBPACK_IMPORTED_MODULE_38__["MatExpansionModule"],
        _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_39__["MatGridListModule"],
        _angular_material_icon__WEBPACK_IMPORTED_MODULE_22__["MatIconModule"],
        _angular_material_input__WEBPACK_IMPORTED_MODULE_21__["MatInputModule"],
        _angular_material_list__WEBPACK_IMPORTED_MODULE_40__["MatListModule"],
        _angular_material_menu__WEBPACK_IMPORTED_MODULE_41__["MatMenuModule"],
        _angular_material_core__WEBPACK_IMPORTED_MODULE_42__["MatNativeDateModule"],
        _angular_material_paginator__WEBPACK_IMPORTED_MODULE_43__["MatPaginatorModule"],
        _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_44__["MatProgressBarModule"],
        _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_45__["MatProgressSpinnerModule"],
        _angular_material_radio__WEBPACK_IMPORTED_MODULE_26__["MatRadioModule"],
        _angular_material_core__WEBPACK_IMPORTED_MODULE_42__["MatRippleModule"],
        _angular_material_select__WEBPACK_IMPORTED_MODULE_46__["MatSelectModule"],
        _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_47__["MatSidenavModule"],
        _angular_material_slider__WEBPACK_IMPORTED_MODULE_48__["MatSliderModule"],
        _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_49__["MatSlideToggleModule"],
        _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_50__["MatSnackBarModule"],
        _angular_material_sort__WEBPACK_IMPORTED_MODULE_51__["MatSortModule"],
        _angular_material_table__WEBPACK_IMPORTED_MODULE_52__["MatTableModule"],
        _angular_material_tabs__WEBPACK_IMPORTED_MODULE_53__["MatTabsModule"],
        _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_54__["MatToolbarModule"],
        _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_55__["MatTooltipModule"],
        _angular_material_tree__WEBPACK_IMPORTED_MODULE_56__["MatTreeModule"],
        _angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpClientModule"],
        _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_80__["DragDropModule"],
        _angular_cdk_clipboard__WEBPACK_IMPORTED_MODULE_84__["ClipboardModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵsetClassMetadata"](AppModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_2__["NgModule"],
        args: [{
                declarations: [
                    _app_component__WEBPACK_IMPORTED_MODULE_5__["AppComponent"],
                    _components_registration_process_registrationpage_registrationpage_component__WEBPACK_IMPORTED_MODULE_6__["RegistrationComponent"],
                    _components_loginpage_loginpage_component__WEBPACK_IMPORTED_MODULE_7__["LoginComponent"],
                    _components_logout_logout_component__WEBPACK_IMPORTED_MODULE_8__["LogoutComponent"],
                    _components_chatsystem_chatwidget_chatwidget_component__WEBPACK_IMPORTED_MODULE_9__["ChatwidgetComponent"],
                    _components_chatsystem_friendlist_friendlist_component__WEBPACK_IMPORTED_MODULE_10__["FriendlistComponent"],
                    _components_header_header_component__WEBPACK_IMPORTED_MODULE_11__["HeaderComponent"],
                    _components_chatsystem_friendlist_friend_friend_component__WEBPACK_IMPORTED_MODULE_12__["FriendComponent"],
                    _components_map_map_component__WEBPACK_IMPORTED_MODULE_13__["MapComponent"],
                    _components_loginpage_loginpage_component__WEBPACK_IMPORTED_MODULE_7__["loginComponent"],
                    _components_chatsystem_chatsystem_component__WEBPACK_IMPORTED_MODULE_16__["ChatsystemComponent"],
                    _components_sidebar_sidebar_component__WEBPACK_IMPORTED_MODULE_17__["SidebarComponent"],
                    _components_profile_profile_component__WEBPACK_IMPORTED_MODULE_18__["ProfileComponent"],
                    _components_profile_proprety_proprety_component__WEBPACK_IMPORTED_MODULE_25__["PropretyComponent"],
                    _components_registration_process_registration_process_component__WEBPACK_IMPORTED_MODULE_57__["RegistrationProcessComponent"],
                    _components_tabs_searchresults_searchresults_component__WEBPACK_IMPORTED_MODULE_58__["SearchresultsComponent"],
                    _components_tabs_home_home_component__WEBPACK_IMPORTED_MODULE_59__["HomeComponent"],
                    _components_myaccount_myaccount_component__WEBPACK_IMPORTED_MODULE_60__["MyaccountComponent"],
                    _components_tabs_mytrip_mytrip_component__WEBPACK_IMPORTED_MODULE_61__["MytripComponent"],
                    _components_registration_process_country_selector_country_selector_component__WEBPACK_IMPORTED_MODULE_62__["CountrySelectorComponent"],
                    _components_tabs_searchresults_VenueButton_VenueButton_component__WEBPACK_IMPORTED_MODULE_63__["VenueButtonComponent"],
                    _components_tabs_mytrip_tripmodal_tripmodal_component__WEBPACK_IMPORTED_MODULE_64__["TripmodalComponent"],
                    _components_venue_venue_component__WEBPACK_IMPORTED_MODULE_65__["VenueComponent"],
                    _components_search_bar_search_bar_component__WEBPACK_IMPORTED_MODULE_66__["SearchBarComponent"],
                    _pipes_list_object_pipe__WEBPACK_IMPORTED_MODULE_67__["ListObjectPipe"],
                    _pipes_null_pipe__WEBPACK_IMPORTED_MODULE_68__["NullPipe"],
                    _components_userprofile_userprofile_component__WEBPACK_IMPORTED_MODULE_69__["UserprofileComponent"],
                    _components_tabs_searchresults_userbutton_userbutton_component__WEBPACK_IMPORTED_MODULE_70__["UserbuttonComponent"],
                    _components_tabs_mytrip_add_venue_popover_add_venue_popover_component__WEBPACK_IMPORTED_MODULE_71__["AddVenuePopoverComponent"],
                    _components_city_search_city_search_component__WEBPACK_IMPORTED_MODULE_72__["CitySearchComponent"],
                    _components_filter_filter_component__WEBPACK_IMPORTED_MODULE_73__["FilterComponent"],
                    _components_sidebar_scroll_to_top_scroll_to_top_component__WEBPACK_IMPORTED_MODULE_74__["ScrollToTopComponent"],
                    _components_add_post_add_post_component__WEBPACK_IMPORTED_MODULE_75__["AddPostComponent"],
                    _components_display_posts_display_posts_component__WEBPACK_IMPORTED_MODULE_76__["DisplayPostsComponent"],
                    _components_comment_section_comment_section_component__WEBPACK_IMPORTED_MODULE_77__["CommentSectionComponent"],
                    _components_comment_comment_component__WEBPACK_IMPORTED_MODULE_78__["CommentComponent"],
                    _components_tabs_searchresults_add_to_trip_popover_add_to_trip_popover_component__WEBPACK_IMPORTED_MODULE_79__["AddToTripPopoverComponent"],
                    _pipes_array_to_pipe_pipe__WEBPACK_IMPORTED_MODULE_81__["ArrayToPipePipe"],
                    _components_edit_comment_edit_comment_component__WEBPACK_IMPORTED_MODULE_82__["EditCommentComponent"],
                    _components_share_share_component__WEBPACK_IMPORTED_MODULE_83__["ShareComponent"],
                    _components_search_posts_search_posts_component__WEBPACK_IMPORTED_MODULE_85__["SearchPostsComponent"],
                    _components_add_tag_add_tag_component__WEBPACK_IMPORTED_MODULE_86__["AddTagComponent"],
                ],
                imports: [
                    _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__["BrowserModule"],
                    _app_routing_module__WEBPACK_IMPORTED_MODULE_4__["AppRoutingModule"],
                    _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormsModule"],
                    _angular_forms__WEBPACK_IMPORTED_MODULE_3__["ReactiveFormsModule"],
                    _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_15__["RxReactiveFormsModule"],
                    _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_14__["NgbModule"],
                    _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_19__["BrowserAnimationsModule"],
                    _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__["MatFormFieldModule"],
                    _angular_material_input__WEBPACK_IMPORTED_MODULE_21__["MatInputModule"],
                    _angular_material_icon__WEBPACK_IMPORTED_MODULE_22__["MatIconModule"],
                    _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_23__["MatCheckboxModule"],
                    _angular_material_button__WEBPACK_IMPORTED_MODULE_24__["MatButtonModule"],
                    _angular_material_radio__WEBPACK_IMPORTED_MODULE_26__["MatRadioModule"],
                    angular_resizable_element__WEBPACK_IMPORTED_MODULE_27__["ResizableModule"],
                    _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_28__["MatAutocompleteModule"],
                    _angular_material_badge__WEBPACK_IMPORTED_MODULE_29__["MatBadgeModule"],
                    _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_30__["MatBottomSheetModule"],
                    _angular_material_button__WEBPACK_IMPORTED_MODULE_24__["MatButtonModule"],
                    _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_31__["MatButtonToggleModule"],
                    _angular_material_card__WEBPACK_IMPORTED_MODULE_32__["MatCardModule"],
                    _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_23__["MatCheckboxModule"],
                    _angular_material_chips__WEBPACK_IMPORTED_MODULE_33__["MatChipsModule"],
                    _angular_material_stepper__WEBPACK_IMPORTED_MODULE_34__["MatStepperModule"],
                    _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_35__["MatDatepickerModule"],
                    _angular_material_dialog__WEBPACK_IMPORTED_MODULE_36__["MatDialogModule"],
                    _angular_material_divider__WEBPACK_IMPORTED_MODULE_37__["MatDividerModule"],
                    _angular_material_expansion__WEBPACK_IMPORTED_MODULE_38__["MatExpansionModule"],
                    _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_39__["MatGridListModule"],
                    _angular_material_icon__WEBPACK_IMPORTED_MODULE_22__["MatIconModule"],
                    _angular_material_input__WEBPACK_IMPORTED_MODULE_21__["MatInputModule"],
                    _angular_material_list__WEBPACK_IMPORTED_MODULE_40__["MatListModule"],
                    _angular_material_menu__WEBPACK_IMPORTED_MODULE_41__["MatMenuModule"],
                    _angular_material_core__WEBPACK_IMPORTED_MODULE_42__["MatNativeDateModule"],
                    _angular_material_paginator__WEBPACK_IMPORTED_MODULE_43__["MatPaginatorModule"],
                    _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_44__["MatProgressBarModule"],
                    _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_45__["MatProgressSpinnerModule"],
                    _angular_material_radio__WEBPACK_IMPORTED_MODULE_26__["MatRadioModule"],
                    _angular_material_core__WEBPACK_IMPORTED_MODULE_42__["MatRippleModule"],
                    _angular_material_select__WEBPACK_IMPORTED_MODULE_46__["MatSelectModule"],
                    _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_47__["MatSidenavModule"],
                    _angular_material_slider__WEBPACK_IMPORTED_MODULE_48__["MatSliderModule"],
                    _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_49__["MatSlideToggleModule"],
                    _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_50__["MatSnackBarModule"],
                    _angular_material_sort__WEBPACK_IMPORTED_MODULE_51__["MatSortModule"],
                    _angular_material_table__WEBPACK_IMPORTED_MODULE_52__["MatTableModule"],
                    _angular_material_tabs__WEBPACK_IMPORTED_MODULE_53__["MatTabsModule"],
                    _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_54__["MatToolbarModule"],
                    _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_55__["MatTooltipModule"],
                    _angular_material_tree__WEBPACK_IMPORTED_MODULE_56__["MatTreeModule"],
                    _angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpClientModule"],
                    _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_80__["DragDropModule"],
                    _angular_cdk_clipboard__WEBPACK_IMPORTED_MODULE_84__["ClipboardModule"]
                ],
                providers: [],
                bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_5__["AppComponent"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "a1cW":
/*!**************************************************************************!*\
  !*** ./src/app/components/tabs/searchresults/searchresults.component.ts ***!
  \**************************************************************************/
/*! exports provided: SearchresultsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SearchresultsComponent", function() { return SearchresultsComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/map/map.service */ "HYNq");
/* harmony import */ var src_app_services_search_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/services/search.service */ "l3hs");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _filter_filter_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../filter/filter.component */ "/J2p");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/card */ "PDjf");
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/progress-spinner */ "pu8Q");
/* harmony import */ var _VenueButton_VenueButton_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./VenueButton/VenueButton.component */ "PAeE");
/* harmony import */ var _userbutton_userbutton_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./userbutton/userbutton.component */ "LdkP");











function SearchresultsComponent_div_1_mat_card_2_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "mat-spinner", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function SearchresultsComponent_div_1_mat_card_2_mat_card_title_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, " No Matches Found... ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function SearchresultsComponent_div_1_mat_card_2_mat_card_title_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, " Search Something! ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function SearchresultsComponent_div_1_mat_card_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-card");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, SearchresultsComponent_div_1_mat_card_2_div_1_Template, 2, 0, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "mat-card-header");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](3, SearchresultsComponent_div_1_mat_card_2_mat_card_title_3_Template, 2, 0, "mat-card-title", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](4, SearchresultsComponent_div_1_mat_card_2_mat_card_title_4_Template, 2, 0, "mat-card-title", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r1.queryParams.query && ctx_r1.loading);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r1.queryParams.query && !ctx_r1.loading);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", !ctx_r1.queryParams.query && !ctx_r1.loading);
} }
function SearchresultsComponent_div_1_div_3_div_1_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "app-venueButton", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const result_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("result", result_r8);
} }
function SearchresultsComponent_div_1_div_3_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, SearchresultsComponent_div_1_div_3_div_1_div_1_Template, 3, 1, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const result_r8 = ctx.$implicit;
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r7.categoriesSet && ctx_r7.checkIfChecked(result_r8.venue.categories[0].id));
} }
function SearchresultsComponent_div_1_div_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, SearchresultsComponent_div_1_div_3_div_1_Template, 2, 1, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx_r2.openTab.content.venues);
} }
function SearchresultsComponent_div_1_div_4_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "app-userbutton", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const result_r12 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("result", result_r12);
} }
function SearchresultsComponent_div_1_div_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, SearchresultsComponent_div_1_div_4_div_1_Template, 2, 1, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx_r3.openTab.content.users);
} }
function SearchresultsComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](2, SearchresultsComponent_div_1_mat_card_2_Template, 5, 3, "mat-card", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](3, SearchresultsComponent_div_1_div_3_Template, 2, 1, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](4, SearchresultsComponent_div_1_div_4_Template, 2, 1, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r0.openTab.content.venues.length === 0 && ctx_r0.openTab.content.users.length === 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r0.checkFilter(1));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r0.checkFilter(2));
} }
class SearchresultsComponent {
    constructor(map, SearchService, ActivatedRoute) {
        this.map = map;
        this.SearchService = SearchService;
        this.ActivatedRoute = ActivatedRoute;
        this.queryParams = {};
        this.loading = null;
        this.categoriesSet = null;
    }
    ngOnInit() {
        this.loading = true;
        // search parameters
        this.ActivatedRoute.queryParams.subscribe((params) => {
            this.queryParams = params;
        });
        this.filter_sub = this.SearchService.filterNumber.subscribe((number) => this.filterNumber = number);
        // response from http queries
        this.returnTab_sub = this.SearchService.searchTab.subscribe((tab) => {
            this.openTab = tab;
            this.loading = false;
        });
        this._categoriesSet_sub = this.SearchService.categorySet.subscribe((set) => {
            if (set) {
                this.categoriesSet = set;
            }
        });
    }
    /** check if state of venues|users filter */
    checkFilter(type) {
        if (this.filterNumber === 0 || type === this.filterNumber) {
            return true;
        }
        else {
            return false;
        }
    }
    checkIfChecked(id) {
        if (this.categoriesSet.has(id)) {
            return true;
        }
        else {
            return false;
        }
    }
    ngOnDestroy() {
        this._categoriesSet_sub.unsubscribe();
        this.filter_sub.unsubscribe();
        this.returnTab_sub.unsubscribe();
    }
}
SearchresultsComponent.ɵfac = function SearchresultsComponent_Factory(t) { return new (t || SearchresultsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_1__["MapService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_search_service__WEBPACK_IMPORTED_MODULE_2__["SearchService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"])); };
SearchresultsComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: SearchresultsComponent, selectors: [["app-searchresults"]], inputs: { select: "select" }, decls: 4, vars: 1, consts: [[1, "container-fluid", "row", 2, "margin", "0", "padding", "0"], ["class", "col mr-auto", "style", "margin-left: 0; padding-left: 0;", 4, "ngIf"], [1, "col", "justify-content-end", 2, "padding-right", "0", "margin-right", "0"], [1, "col", "mr-auto", 2, "margin-left", "0", "padding-left", "0"], [4, "ngIf"], ["style", "min-height: 600px;", 4, "ngIf"], ["class", "container-fluid row justify-content-center", "style", "overflow: hidden; padding-top: 1em;", 4, "ngIf"], [1, "container-fluid", "row", "justify-content-center", 2, "overflow", "hidden", "padding-top", "1em"], [1, "col-auto"], [2, "min-height", "600px"], [4, "ngFor", "ngForOf"], [3, "result"]], template: function SearchresultsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, SearchresultsComponent_div_1_Template, 5, 3, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](3, "app-filter");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.openTab.content);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_4__["NgIf"], _filter_filter_component__WEBPACK_IMPORTED_MODULE_5__["FilterComponent"], _angular_material_card__WEBPACK_IMPORTED_MODULE_6__["MatCard"], _angular_material_card__WEBPACK_IMPORTED_MODULE_6__["MatCardHeader"], _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_7__["MatSpinner"], _angular_material_card__WEBPACK_IMPORTED_MODULE_6__["MatCardTitle"], _angular_common__WEBPACK_IMPORTED_MODULE_4__["NgForOf"], _VenueButton_VenueButton_component__WEBPACK_IMPORTED_MODULE_8__["VenueButtonComponent"], _userbutton_userbutton_component__WEBPACK_IMPORTED_MODULE_9__["UserbuttonComponent"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzZWFyY2hyZXN1bHRzLmNvbXBvbmVudC5zY3NzIn0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](SearchresultsComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-searchresults',
                templateUrl: './searchresults.component.html',
                styleUrls: ['./searchresults.component.scss']
            }]
    }], function () { return [{ type: src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_1__["MapService"] }, { type: src_app_services_search_service__WEBPACK_IMPORTED_MODULE_2__["SearchService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"] }]; }, { select: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }] }); })();


/***/ }),

/***/ "aer8":
/*!*******************************************************!*\
  !*** ./src/app/components/logout/logout.component.ts ***!
  \*******************************************************/
/*! exports provided: LogoutComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LogoutComponent", function() { return LogoutComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_session_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/session.service */ "IfdK");
/* harmony import */ var src_app_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/services/chatsystem/socket.service */ "QeH8");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");







function LogoutComponent_button_0_Template(rf, ctx) { if (rf & 1) {
    const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function LogoutComponent_button_0_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r2); const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r1.logout(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, " Logout\n");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
class LogoutComponent {
    constructor(SessionService, SocketService, router) {
        this.SessionService = SessionService;
        this.SocketService = SocketService;
        this.router = router;
        this.sessionSate_sub = this.SessionService.sessionState.subscribe((x) => this.sessionState = x);
    }
    ngOnInit() {
    }
    // logout user
    logout() {
        if (sessionStorage.getItem('username')) {
            this.SocketService.emit('logout', sessionStorage.getItem('username'), (data) => {
                if (data.res) {
                    this.SessionService.session();
                }
            });
        }
        localStorage.removeItem('username');
        sessionStorage.clear();
        window.location.reload();
    }
    ngOnDestroy() {
        this.sessionSate_sub.unsubscribe();
    }
}
LogoutComponent.ɵfac = function LogoutComponent_Factory(t) { return new (t || LogoutComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_session_service__WEBPACK_IMPORTED_MODULE_1__["SessionService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_2__["SocketService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"])); };
LogoutComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: LogoutComponent, selectors: [["app-logout"]], decls: 1, vars: 1, consts: [["mat-flat-button", "", "color", "warn", "routerLink", "/", 3, "click", 4, "ngIf"], ["mat-flat-button", "", "color", "warn", "routerLink", "/", 3, "click"]], template: function LogoutComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](0, LogoutComponent_button_0_Template, 2, 0, "button", 0);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.sessionState);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_4__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_5__["MatButton"], _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterLink"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJsb2dvdXQuY29tcG9uZW50LnNjc3MifQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](LogoutComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-logout',
                templateUrl: './logout.component.html',
                styleUrls: ['./logout.component.scss']
            }]
    }], function () { return [{ type: src_app_services_session_service__WEBPACK_IMPORTED_MODULE_1__["SessionService"] }, { type: src_app_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_2__["SocketService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"] }]; }, null); })();


/***/ }),

/***/ "b74p":
/*!*********************************************!*\
  !*** ./src/app/models/Room_Widget.model.ts ***!
  \*********************************************/
/*! exports provided: RoomWidget */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RoomWidget", function() { return RoomWidget; });
class RoomWidget {
    constructor(roomName, roomId, unread) {
        this.roomId = roomId;
        this.roomName = roomName;
    }
}


/***/ }),

/***/ "bDK8":
/*!*************************************************************************!*\
  !*** ./src/app/components/tabs/mytrip/tripmodal/tripmodal.component.ts ***!
  \*************************************************************************/
/*! exports provided: TripmodalComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TripmodalComponent", function() { return TripmodalComponent; });
/* harmony import */ var _models_trip_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../models/trip.model */ "VX6k");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/dialog */ "iELJ");
/* harmony import */ var src_app_services_http_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/services/http.service */ "N+K7");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/card */ "PDjf");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/input */ "e6WT");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/datepicker */ "TN/R");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/progress-spinner */ "pu8Q");
















function TripmodalComponent_small_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "small", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1, "please create a name");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} }
function TripmodalComponent_button_24_Template(rf, ctx) { if (rf & 1) {
    const _r5 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "button", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function TripmodalComponent_button_24_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r5); const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](); return ctx_r4.onSubmit(ctx_r4.data); });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1, "Save");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} }
function TripmodalComponent_button_25_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "button", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](1, "mat-spinner", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("diameter", 50);
} }
class TripmodalComponent {
    constructor(dialogRef, data, HttpService) {
        this.dialogRef = dialogRef;
        this.data = data;
        this.HttpService = HttpService;
        this.minDate = new Date();
        this.isLoading = false;
        this.nameErr = false;
        this.modalForm = new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroup"]({
            name: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](null, [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].minLength(1)], this.checkName.bind(this)),
            dateRange: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroup"]({
                start: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](null),
                end: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](null)
            })
        });
    }
    ngOnInit() {
    }
    /** check if name of trip is unique**/
    checkName(control) {
        return new Promise((resolve, reject) => {
            this.HttpService.get('/user', {})
                .then((response) => {
                const trips = response.user[0].trips ? response.user[0].trips : null;
                if (trips) {
                    this.trips = trips;
                    for (let x = 0; x < trips.length; x++) {
                        if (trips[x].tripName == control.value) {
                            resolve({ err: 'name already exists' });
                            break;
                        }
                    }
                    resolve(null);
                }
                else {
                    resolve(null);
                }
            })
                .catch(err => {
                console.log('err', err);
                reject(err.message);
            });
        });
    }
    /** submit creation of trip */
    onSubmit(data) {
        this.isLoading = true;
        const valid = this.checkName({ value: data.name });
        if (typeof (valid) == 'string') {
            this.isLoading = false;
        }
        else {
            this.trips.push(new _models_trip_model__WEBPACK_IMPORTED_MODULE_0__["tripModel"](data.start, data.end, data.name));
            this.HttpService.patch('/user/edit', {
                username: localStorage.getItem('username'),
                proprety: 'trips',
                newProprety: this.trips
            })
                .then((response) => {
                if (response.message) {
                    this.dialogRef.close(new _models_trip_model__WEBPACK_IMPORTED_MODULE_0__["tripModel"](data.start, data.end, data.name));
                }
            })
                .catch(err => {
                console.log(err);
            })
                .finally(() => {
                this.isLoading = false;
            });
        }
    }
    onCancel() {
        this.dialogRef.close();
    }
}
TripmodalComponent.ɵfac = function TripmodalComponent_Factory(t) { return new (t || TripmodalComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__["MatDialogRef"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__["MAT_DIALOG_DATA"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](src_app_services_http_service__WEBPACK_IMPORTED_MODULE_4__["HttpService"])); };
TripmodalComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({ type: TripmodalComponent, selectors: [["app-tripmodal"]], decls: 26, vars: 10, consts: [[1, "container-fluid"], ["mat-dialog-title", ""], ["mat-dialog-content", "", 1, "container-fluid"], [3, "formGroup"], [1, "example-full-width"], ["matInput", "", "formControlName", "name", "placeholder", "Ex. Simon va a Prague", 3, "ngModel", "ngModelChange"], ["class", "text-danger", 4, "ngIf"], ["formGroupName", "dateRange", 3, "rangePicker", "min"], ["matStartDate", "", "placeholder", "Start date", "formControlName", "start", 3, "ngModel", "ngModelChange"], ["matEndDate", "", "placeholder", "End date", "formControlName", "end", 3, "ngModel", "ngModelChange"], ["matSuffix", "", 3, "for"], ["picker", ""], ["mat-dialog-actions", ""], ["mat-button", "", 3, "click"], ["mat-button", "", "color", "primary", 3, "click", 4, "ngIf"], ["mat-button", "", 4, "ngIf"], [1, "text-danger"], ["mat-button", "", "color", "primary", 3, "click"], ["mat-button", ""], [3, "diameter"]], template: function TripmodalComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "mat-card", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "mat-card-title", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](2, " New Trip ");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](3, "hr");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](4, "mat-card-content", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](5, "form", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](6, "mat-form-field", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](7, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](8, "Trip Name");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](9, "input", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("ngModelChange", function TripmodalComponent_Template_input_ngModelChange_9_listener($event) { return ctx.data.name = $event; });
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](10, TripmodalComponent_small_10_Template, 2, 0, "small", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](11, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](12, "mat-form-field");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](13, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](14, "Enter a date range");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](15, "mat-date-range-input", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](16, "input", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("ngModelChange", function TripmodalComponent_Template_input_ngModelChange_16_listener($event) { return ctx.data.start = $event; });
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](17, "input", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("ngModelChange", function TripmodalComponent_Template_input_ngModelChange_17_listener($event) { return ctx.data.end = $event; });
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](18, "mat-datepicker-toggle", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](19, "mat-date-range-picker", null, 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](21, "mat-card-actions", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](22, "button", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function TripmodalComponent_Template_button_click_22_listener() { return ctx.onCancel(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](23, "Cancel");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](24, TripmodalComponent_button_24_Template, 2, 0, "button", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](25, TripmodalComponent_button_25_Template, 2, 1, "button", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    } if (rf & 2) {
        const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵreference"](20);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("formGroup", ctx.modalForm);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngModel", ctx.data.name);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.modalForm.get("name").touched && !ctx.modalForm.get("name").valid);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("rangePicker", _r1)("min", ctx.minDate);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngModel", ctx.data.start);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngModel", ctx.data.end);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("for", _r1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", !ctx.isLoading);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.isLoading);
    } }, directives: [_angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCard"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCardTitle"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__["MatDialogTitle"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCardContent"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__["MatDialogContent"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroupDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_6__["ɵa"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_7__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_7__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_8__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControlName"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_6__["ɵk"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_6__["ɵe"], _angular_common__WEBPACK_IMPORTED_MODULE_9__["NgIf"], _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_10__["MatDateRangeInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroupName"], _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_10__["MatStartDate"], _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_10__["MatEndDate"], _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_10__["MatDatepickerToggle"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_7__["MatSuffix"], _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_10__["MatDateRangePicker"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCardActions"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__["MatDialogActions"], _angular_material_button__WEBPACK_IMPORTED_MODULE_11__["MatButton"], _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_12__["MatSpinner"]], styles: ["button[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFwuLlxcLi5cXHRyaXBtb2RhbC5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLGFBQUE7QUFDSiIsImZpbGUiOiJ0cmlwbW9kYWwuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyJidXR0b246Zm9jdXMge1xyXG4gICAgb3V0bGluZTogbm9uZTtcclxufSJdfQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵsetClassMetadata"](TripmodalComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_2__["Component"],
        args: [{
                selector: 'app-tripmodal',
                templateUrl: './tripmodal.component.html',
                styleUrls: ['./tripmodal.component.scss']
            }]
    }], function () { return [{ type: _angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__["MatDialogRef"] }, { type: undefined, decorators: [{
                type: _angular_core__WEBPACK_IMPORTED_MODULE_2__["Inject"],
                args: [_angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__["MAT_DIALOG_DATA"]]
            }] }, { type: src_app_services_http_service__WEBPACK_IMPORTED_MODULE_4__["HttpService"] }]; }, null); })();


/***/ }),

/***/ "ciVQ":
/*!************************************************************!*\
  !*** ./src/app/components/add-post/mime-type.validator.ts ***!
  \************************************************************/
/*! exports provided: mimeType */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mimeType", function() { return mimeType; });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ "qCKp");

const mimeType = (control) => {
    if (typeof (control.value) === 'string') {
        return Object(rxjs__WEBPACK_IMPORTED_MODULE_0__["of"])(null);
    }
    const file = control.value;
    const fileReader = new FileReader();
    const frObs = rxjs__WEBPACK_IMPORTED_MODULE_0__["Observable"].create((observer) => {
        fileReader.addEventListener('loadend', () => {
            const arr = new Uint8Array(fileReader.result).subarray(0, 4);
            let header = '';
            let isValid = false;
            for (let i = 0; i < arr.length; i++) {
                header += arr[i].toString(16);
            }
            switch (header) {
                case '89504e47':
                    isValid = true;
                    break;
                case 'ffd8ffe0':
                case 'ffd8ffe1':
                case 'ffd8ffe2':
                case 'ffd8ffe3':
                case 'ffd8ffe8':
                    isValid = true;
                    break;
                default:
                    isValid = false; // Or you can use the blob.type as fallback
                    break;
            }
            if (isValid) {
                observer.next(null);
            }
            else {
                observer.next({ invalidMimeType: true });
            }
            observer.complete();
        });
        fileReader.readAsArrayBuffer(file);
    });
    return frObs;
};


/***/ }),

/***/ "cxbk":
/*!**********************************************!*\
  !*** ./src/environments/environment.prod.ts ***!
  \**********************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
/* harmony import */ var _app_models_coordinates__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../app/models/coordinates */ "FvPJ");

const environment = {
    production: true,
    language: 'en',
    // travelnetURL: 'https://travelnet.herokuapp.com',
    travelnetURL: 'localhost:3000',
    travelnetCommentURL: "localhost:3000/api/comments/",
    mapbox: {
        token: 'pk.eyJ1IjoidHJhdmVsbmV0IiwiYSI6ImNrOTk3cHkwaDAzaHkzZHEwMm03ZGN0MG8ifQ.j24u0Q5RbYw7PW4tVpGjmQ',
        geocoding: 'https://api.mapbox.com/geocoding/v5/mapbox.places'
    },
    foursquare: {
        clientId: 'NYZJ324E5GAY2MSQUNYIYLKIDCMX2ETMQREKQXZLW3S5ZYVG',
        clientSecret: 'K51P2Y1T3TMTCU24LOFHDFOAONPGU44ZBNZCGTWCOJESUW4A',
        v: '',
        venuesSearch: 'https://api.foursquare.com/v2/venues/search',
        venuesExplore: 'https://api.foursquare.com/v2/venues/explore',
        venueDetails: 'https://api.foursquare.com/v2/venues',
        userAuth: 'https://foursquare.com/oauth2/authenticate',
        getCategories: 'https://api.foursquare.com/v2/venues/categories',
    },
    nominatim: {
        search: 'https://nominatim.openstreetmap.org/search',
        reverse: 'https://nominatim.openstreetmap.org/reverse'
    },
    openstreetmap: {
        searchNodes: 'https://master.apis.dev.openstreetmap.org/api/0.6/map',
        searchRealNode: ' https://api.openstreetmap.org/api/0.6/map'
    },
    travelnet: {
        getUserInfo: 'https://travelnet.herokuapp.com/user',
        getProfile: 'https://travelnet.herokuapp.com/profile',
        searchUsers: 'https://travelnet.herokuapp.com/searchusers',
        travelnetCommentURL: 'https://travelnet.herokuapp.com/comments',
        travelnetPostURL: 'https://travelnet.herokuapp.com/posts',
    },
    montrealCoord: new _app_models_coordinates__WEBPACK_IMPORTED_MODULE_0__["CustomCoordinates"](-73.5633265, 45.5009128)
};


/***/ }),

/***/ "fGHt":
/*!*********************************************************!*\
  !*** ./src/app/components/comment/comment.component.ts ***!
  \*********************************************************/
/*! exports provided: CommentComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CommentComponent", function() { return CommentComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _edit_comment_edit_comment_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../edit-comment/edit-comment.component */ "OM0W");
/* harmony import */ var src_app_services_comments_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/services/comments.service */ "Tvdm");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/dialog */ "iELJ");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/card */ "PDjf");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/input */ "e6WT");













function CommentComponent_button_8_Template(rf, ctx) { if (rf & 1) {
    const _r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function CommentComponent_button_8_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r5); const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r4.deleteTreeComment(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "DELETE");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function CommentComponent_button_9_Template(rf, ctx) { if (rf & 1) {
    const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function CommentComponent_button_9_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r7); const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r6.editTreeComment(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "EDIT");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function CommentComponent_button_10_Template(rf, ctx) { if (rf & 1) {
    const _r9 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function CommentComponent_button_10_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r9); const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r8.showParentEdits(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "edited");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function CommentComponent_div_11_mat_card_1_button_11_Template(rf, ctx) { if (rf & 1) {
    const _r17 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function CommentComponent_div_11_mat_card_1_button_11_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r17); const reply_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit; const ctx_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r15.editLeafComment(reply_r12); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "EDIT");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function CommentComponent_div_11_mat_card_1_button_12_Template(rf, ctx) { if (rf & 1) {
    const _r20 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function CommentComponent_div_11_mat_card_1_button_12_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r20); const reply_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit; const ctx_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r18.showLeafEdits(reply_r12); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "edited");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function CommentComponent_div_11_mat_card_1_Template(rf, ctx) { if (rf & 1) {
    const _r22 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-card");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-card-header");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "button", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function CommentComponent_div_11_mat_card_1_Template_button_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r22); const reply_r12 = ctx.$implicit; const ctx_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r21.likeLeafComment(reply_r12._id); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5, "LIKE");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "button", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](8, "REPLY");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](9, "button", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function CommentComponent_div_11_mat_card_1_Template_button_click_9_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r22); const reply_r12 = ctx.$implicit; const ctx_r23 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r23.deleteLeafComment(reply_r12._id); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](10, "DELETE");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](11, CommentComponent_div_11_mat_card_1_button_11_Template, 2, 0, "button", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](12, CommentComponent_div_11_mat_card_1_button_12_Template, 2, 0, "button", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const reply_r12 = ctx.$implicit;
    const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate2"](" ", reply_r12.author, " : ", reply_r12.content, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", reply_r12.likes.length, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r10.ownContent(reply_r12.author));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", reply_r12.edited && reply_r12.edited.length > 0 && ctx_r10.ownContent(reply_r12.author));
} }
function CommentComponent_div_11_div_2_Template(rf, ctx) { if (rf & 1) {
    const _r25 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "form", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("submit", function CommentComponent_div_11_div_2_Template_form_submit_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r25); const ctx_r24 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r24.onAddReply(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "mat-form-field");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](3, "input", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("formGroup", ctx_r11.form);
} }
function CommentComponent_div_11_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, CommentComponent_div_11_mat_card_1_Template, 13, 5, "mat-card", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](2, CommentComponent_div_11_div_2_Template, 4, 1, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx_r3.comment.replies);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r3.replyField);
} }
class CommentComponent {
    constructor(commentsService, dialog) {
        this.commentsService = commentsService;
        this.dialog = dialog;
        this.displayEdits = false;
        this.replyField = true;
        this.showReplies = false;
    }
    ngOnInit() {
        this.form = new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroup"]({
            content: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](null, { validators: [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].required] }),
        });
    }
    replyBoolean() {
        this.replyField = !this.replyField;
    }
    onAddReply() {
        if (this.form.invalid) {
            return;
        }
        const newReply = {
            date: new Date().toLocaleString(),
            author: sessionStorage.getItem('username'),
            content: this.form.value.content,
        };
        const replyContent = {
            postId: this.postId,
            commentId: this.comment._id,
            reply: newReply
        };
        this.commentsService.reply(replyContent);
        this.form.reset();
    }
    likeTreeComment() {
        const likeContent = {
            postId: this.postId,
            commentId: this.comment._id,
            username: sessionStorage.getItem('username'),
            replyId: null
        };
        this.commentsService.likeComment(likeContent);
    }
    likeLeafComment(replyId) {
        const likeContent = {
            postId: this.postId,
            commentId: this.comment._id,
            username: sessionStorage.getItem('username'),
            replyId
        };
        this.commentsService.likeComment(likeContent);
    }
    deleteTreeComment() {
        const deleteContent = {
            postId: this.postId,
            commentId: this.comment._id,
            replyId: null
        };
        this.commentsService.deleteComment(deleteContent);
    }
    deleteLeafComment(replyId) {
        const deleteContent = {
            postId: this.postId,
            commentId: this.comment._id,
            replyId
        };
        this.commentsService.deleteComment(deleteContent);
    }
    editTreeComment() {
        const commentInfo = {
            postId: this.postId,
            comment: this.comment,
            reply: null
        };
        const dialogRef = this.dialog.open(_edit_comment_edit_comment_component__WEBPACK_IMPORTED_MODULE_2__["EditCommentComponent"], { data: { displayEdits: false, commentData: commentInfo } });
        dialogRef.afterClosed().subscribe();
    }
    editLeafComment(reply) {
        const commentInfo = {
            postId: this.postId,
            comment: this.comment,
            reply
        };
        const dialogRef = this.dialog.open(_edit_comment_edit_comment_component__WEBPACK_IMPORTED_MODULE_2__["EditCommentComponent"], { data: { displayEdits: false, commentData: commentInfo } });
        dialogRef.afterClosed().subscribe();
    }
    showParentEdits() {
        const commentInfo = {
            postId: this.postId,
            comment: this.comment,
            reply: null
        };
        const dialogRef = this.dialog.open(_edit_comment_edit_comment_component__WEBPACK_IMPORTED_MODULE_2__["EditCommentComponent"], { data: { displayEdits: true, commentData: commentInfo } });
        dialogRef.afterClosed().subscribe();
    }
    showLeafEdits(reply) {
        const commentInfo = {
            postId: this.postId,
            comment: reply,
            reply: true
        };
        const dialogRef = this.dialog.open(_edit_comment_edit_comment_component__WEBPACK_IMPORTED_MODULE_2__["EditCommentComponent"], { data: { displayEdits: true, commentData: commentInfo } });
        dialogRef.afterClosed().subscribe();
    }
    ownContent(content) {
        if (content.author === sessionStorage.getItem('username')) {
            return true;
        }
    }
}
CommentComponent.ɵfac = function CommentComponent_Factory(t) { return new (t || CommentComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_comments_service__WEBPACK_IMPORTED_MODULE_3__["CommentsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_4__["MatDialog"])); };
CommentComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: CommentComponent, selectors: [["app-comment"]], inputs: { comment: "comment", postId: "postId" }, decls: 12, vars: 7, consts: [["mat-button", "", 3, "click"], ["mat-button", "", 3, "click", 4, "ngIf"], [4, "ngIf"], [4, "ngFor", "ngForOf"], ["mat-button", ""], [3, "formGroup", "submit"], ["matInput", "", "type", "text", "formControlName", "content", "placeholder", "say something..."]], template: function CommentComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-card");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "button", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function CommentComponent_Template_button_click_3_listener() { return ctx.likeTreeComment(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4, "LIKE");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "button", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function CommentComponent_Template_button_click_6_listener() { return ctx.replyBoolean(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](7, "REPLY");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](8, CommentComponent_button_8_Template, 2, 0, "button", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](9, CommentComponent_button_9_Template, 2, 0, "button", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](10, CommentComponent_button_10_Template, 2, 0, "button", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](11, CommentComponent_div_11_Template, 3, 2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate2"](" ", ctx.comment.author, " : ", ctx.comment.content, " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", ctx.comment.likes.length, " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.ownContent(ctx.comment.author));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.ownContent(ctx.comment.author));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.comment.edited && ctx.comment.edited.length > 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.replyField);
    } }, directives: [_angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCard"], _angular_material_button__WEBPACK_IMPORTED_MODULE_6__["MatButton"], _angular_common__WEBPACK_IMPORTED_MODULE_7__["NgIf"], _angular_common__WEBPACK_IMPORTED_MODULE_7__["NgForOf"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCardHeader"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroupDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_8__["ɵa"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_9__["MatFormField"], _angular_material_input__WEBPACK_IMPORTED_MODULE_10__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControlName"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_8__["ɵk"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_8__["ɵe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjb21tZW50LmNvbXBvbmVudC5zY3NzIn0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](CommentComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-comment',
                templateUrl: './comment.component.html',
                styleUrls: ['./comment.component.scss']
            }]
    }], function () { return [{ type: src_app_services_comments_service__WEBPACK_IMPORTED_MODULE_3__["CommentsService"] }, { type: _angular_material_dialog__WEBPACK_IMPORTED_MODULE_4__["MatDialog"] }]; }, { comment: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }], postId: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }] }); })();


/***/ }),

/***/ "hZyq":
/*!*******************************************!*\
  !*** ./src/app/pipes/list-object.pipe.ts ***!
  \*******************************************/
/*! exports provided: ListObjectPipe */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ListObjectPipe", function() { return ListObjectPipe; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");


class ListObjectPipe {
    transform(value, ...args) {
        return null;
    }
}
ListObjectPipe.ɵfac = function ListObjectPipe_Factory(t) { return new (t || ListObjectPipe)(); };
ListObjectPipe.ɵpipe = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefinePipe"]({ name: "listObject", type: ListObjectPipe, pure: true });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ListObjectPipe, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Pipe"],
        args: [{
                name: 'listObject'
            }]
    }], null, null); })();


/***/ }),

/***/ "hihI":
/*!*************************************************************************!*\
  !*** ./src/app/components/comment-section/comment-section.component.ts ***!
  \*************************************************************************/
/*! exports provided: CommentSectionComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CommentSectionComponent", function() { return CommentSectionComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var src_app_services_add_post_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/services/add-post.service */ "woXb");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var src_app_services_comments_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/services/comments.service */ "Tvdm");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/card */ "PDjf");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/input */ "e6WT");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _comment_comment_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../comment/comment.component */ "fGHt");













function CommentSectionComponent_app_comment_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "app-comment", 3);
} if (rf & 2) {
    const comment_r1 = ctx.$implicit;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("comment", comment_r1)("postId", ctx_r0.post._id);
} }
class CommentSectionComponent {
    constructor(postsService, route, commentsService) {
        this.postsService = postsService;
        this.route = route;
        this.commentsService = commentsService;
    }
    ngOnInit() {
        this.form = new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroup"]({
            content: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](null, { validators: [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].required] }),
        });
    }
    onAddComment() {
        if (this.form.invalid) {
            return;
        }
        const newComment = {
            date: new Date().toLocaleString(),
            author: sessionStorage.getItem('username'),
            content: this.form.value.content,
        };
        this.commentsService.addComment(newComment, this.post._id);
        this.form.reset();
    }
}
CommentSectionComponent.ɵfac = function CommentSectionComponent_Factory(t) { return new (t || CommentSectionComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_add_post_service__WEBPACK_IMPORTED_MODULE_2__["AddPostService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_comments_service__WEBPACK_IMPORTED_MODULE_4__["CommentsService"])); };
CommentSectionComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: CommentSectionComponent, selectors: [["app-comment-section"]], inputs: { post: "post" }, decls: 5, vars: 2, consts: [[3, "formGroup", "submit"], ["matInput", "", "type", "text", "formControlName", "content", "placeholder", "say something..."], [3, "comment", "postId", 4, "ngFor", "ngForOf"], [3, "comment", "postId"]], template: function CommentSectionComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-card");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "form", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("submit", function CommentSectionComponent_Template_form_submit_1_listener() { return ctx.onAddComment(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "mat-form-field");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](3, "input", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](4, CommentSectionComponent_app_comment_4_Template, 1, 2, "app-comment", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("formGroup", ctx.form);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.post.comments);
    } }, directives: [_angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCard"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroupDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_6__["ɵa"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_7__["MatFormField"], _angular_material_input__WEBPACK_IMPORTED_MODULE_8__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControlName"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_6__["ɵk"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_6__["ɵe"], _angular_common__WEBPACK_IMPORTED_MODULE_9__["NgForOf"], _comment_comment_component__WEBPACK_IMPORTED_MODULE_10__["CommentComponent"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjb21tZW50LXNlY3Rpb24uY29tcG9uZW50LnNjc3MifQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](CommentSectionComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-comment-section',
                templateUrl: './comment-section.component.html',
                styleUrls: ['./comment-section.component.scss']
            }]
    }], function () { return [{ type: src_app_services_add_post_service__WEBPACK_IMPORTED_MODULE_2__["AddPostService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"] }, { type: src_app_services_comments_service__WEBPACK_IMPORTED_MODULE_4__["CommentsService"] }]; }, { post: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }] }); })();


/***/ }),

/***/ "ijTB":
/*!************************************************************************************************!*\
  !*** ./src/app/components/registration-process/registrationpage/registrationpage.component.ts ***!
  \************************************************************************************************/
/*! exports provided: RegistrationComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RegistrationComponent", function() { return RegistrationComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "G0yt");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! moment */ "wd/R");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../services/chatsystem/socket.service */ "QeH8");
/* harmony import */ var _services_session_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../services/session.service */ "IfdK");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var src_app_services_map_foursquare_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! src/app/services/map/foursquare.service */ "PiFF");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/input */ "e6WT");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");
/* harmony import */ var _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/datepicker */ "TN/R");
/* harmony import */ var _angular_material_radio__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/radio */ "zQhy");
/* harmony import */ var _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/checkbox */ "pMoy");




















function RegistrationComponent_form_0_small_9_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "small", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "This username is already in use.");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function RegistrationComponent_form_0_small_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "small", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "Your username must be between 2 and 15 characters long.");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function RegistrationComponent_form_0_small_16_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "small", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "your password should be between 5-15 characters");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function RegistrationComponent_form_0_small_24_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "small", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "your passwords do not match");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function RegistrationComponent_form_0_small_32_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "small", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "Please enter a valid email");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function RegistrationComponent_form_0_Template(rf, ctx) { if (rf & 1) {
    const _r10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "form", 2, 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("ngSubmit", function RegistrationComponent_form_0_Template_form_ngSubmit_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r10); const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r9.onSubmit(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "h1", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3, "Registration");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](4, "hr");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "mat-form-field", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "mat-label", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](7, "Username");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](8, "input", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](9, RegistrationComponent_form_0_small_9_Template, 2, 0, "small", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](10, RegistrationComponent_form_0_small_10_Template, 2, 0, "small", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "mat-form-field", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](13, "mat-label", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](14, "Password");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](15, "input", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](16, RegistrationComponent_form_0_small_16_Template, 2, 0, "small", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](17, "button", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function RegistrationComponent_form_0_Template_button_click_17_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r10); const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r11.hide = !ctx_r11.hide; });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](18, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](19);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](20, "mat-form-field", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](21, "mat-label", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](22, "Confirm your password");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](23, "input", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](24, RegistrationComponent_form_0_small_24_Template, 2, 0, "small", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](25, "button", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function RegistrationComponent_form_0_Template_button_click_25_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r10); const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r12.hide1 = !ctx_r12.hide1; });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](26, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](27);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](28, "mat-form-field", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](29, "mat-label", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](30, "Email Address");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](31, "input", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](32, RegistrationComponent_form_0_small_32_Template, 2, 0, "small", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](33, "small", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](34, "We'll never share your email with anyone else.");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](35, "div", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](36, "div", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](37, "div", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](38, "mat-form-field", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](39, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](40, "Birthdate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](41, "input", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](42, "mat-datepicker-toggle", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](43, "mat-datepicker", 26, 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](45, "mat-label", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](46, "Gender");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](47, "mat-radio-group", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](48, "mat-radio-button", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](49, "Male");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](50, "mat-radio-button", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](51, "Female");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](52, "mat-radio-button", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](53, "Other");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](54, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](55, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](56, "mat-checkbox", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](57, "label", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](58, "I have read and understand the terms & conditions of this agreement");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](59, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](60, "button", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](61, "Register");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const _r8 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵreference"](44);
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("formGroup", ctx_r0.registrationForm);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r0.checkUsernameUse());
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r0.checkUsernameLength());
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("type", ctx_r0.hide ? "password" : "text");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r0.checkPasswordLength());
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵattribute"]("aria-label", "Hide password")("aria-pressed", ctx_r0.hide);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx_r0.hide ? "visibility_off" : "visibility");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("type", ctx_r0.hide1 ? "password" : "text");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r0.checkPasswordValidity);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵattribute"]("aria-label", "Hide password")("aria-pressed", ctx_r0.hide1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx_r0.hide1 ? "visibility_off" : "visibility");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r0.checkEmailValidity());
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("matDatepicker", _r8)("max", ctx_r0.currentTime);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("for", _r8);
} }
function RegistrationComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "h2");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, "You are already registered");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
class RegistrationComponent {
    constructor(SocketService, sessionService, modalService, router, FoursquareService) {
        this.SocketService = SocketService;
        this.sessionService = sessionService;
        this.modalService = modalService;
        this.router = router;
        this.FoursquareService = FoursquareService;
        this.hide = true;
        this.hide1 = true;
        this.currentTime = new Date().toISOString();
        this.checkPasswordValidity = false;
    }
    ngOnInit() {
        this.registrationForm = new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormGroup"]({
            // 'name': new FormGroup({
            //   'firstName': new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
            //   'lastName': new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
            // },),
            passwords: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormGroup"]({
                password: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].minLength(5), _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].maxLength(15)]),
                confirmPassword: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].minLength(5), _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].maxLength(15)]),
            }, this.checkPasswordsMatch.bind(this)),
            birthDate: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required]),
            username: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].minLength(2), _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].maxLength(15)], this.forbiddenUsernames.bind(this)),
            email: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].email]),
            checkbox: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required]),
            gender: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required]),
        });
        this.sessionState_sub = this.sessionService.sessionState.subscribe((state) => {
            this.sessionState = state;
        });
    }
    checkUsernameUse() {
        if (this.registrationForm.get('username').errors && this.registrationForm.get('username').dirty) {
            if (this.registrationForm.get('username').errors.forbiddenUsername) {
                return true;
            }
        }
        else {
            return false;
        }
    }
    checkUsernameLength() {
        if (this.registrationForm.get('username').errors && this.registrationForm.get('username').dirty) {
            if (this.registrationForm.get('username').errors.maxlength || this.registrationForm.get('username').errors.minlength) {
                return true;
            }
        }
        else {
            return false;
        }
    }
    checkPasswordsMatch(control) {
        if (this.registrationForm) {
            const pass = control.get('password').value;
            const confirm = control.get('confirmPassword').value;
            if (pass === confirm) {
                this.checkPasswordValidity = false;
                return;
            }
            else {
                if (control.get('confirmPassword').dirty) {
                    this.checkPasswordValidity = true;
                }
                return;
            }
        }
    }
    checkPasswordLength() {
        if (this.registrationForm.get('passwords.password').errors && this.registrationForm.get('passwords.password').dirty) {
            if (this.registrationForm.get('passwords.password').errors.maxlength || this.registrationForm.get('passwords.password').errors.minlength) {
                return true;
            }
        }
    }
    checkEmailValidity() {
        if (this.registrationForm.get('email').errors && this.registrationForm.get('email').dirty) {
            if (this.registrationForm.get('email').errors.email) {
                return true;
            }
        }
    }
    // check if user is older than 13
    isOld() {
        const birth = this.registrationForm.get('birthDate').value;
        const now = moment__WEBPACK_IMPORTED_MODULE_3__(this.currentTime);
        const difference = now.diff(birth, 'years');
        if (difference < 13) {
            return false;
        }
        else {
            return true;
        }
    }
    forbiddenUsernames(control) {
        return new Promise((resolve, reject) => {
            this.SocketService.emit('searchUser', [control.value], (res) => {
                if (res.res) {
                    resolve({ forbiddenUsername: true });
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    onSubmit() {
        // check age
        if (this.isOld()) {
            // check form validity && if logged in
            if (this.registrationForm.valid && !(sessionStorage.getItem('username'))) {
                const data = {
                    // firstName:this.registrationForm.get('name.firstName').value,
                    // lastName:this.registrationForm.get('name.lastName').value,
                    email: this.registrationForm.get('email').value,
                    username: this.registrationForm.get('username').value,
                    password: this.registrationForm.get('passwords.password').value,
                    gender: this.registrationForm.get('gender').value,
                    birthdate: this.registrationForm.get('birthDate').value
                };
                this.SocketService.emit('createUser', data, (res) => {
                    // error in backend
                    if (res.err) {
                        alert(`an error occured ${res.err}`);
                    }
                    // successfull
                    else if (res.user) {
                        sessionStorage.setItem('username', res.user.username);
                        localStorage.setItem('token', res.token);
                        localStorage.setItem('username', res.user.username);
                        this.sessionService.session();
                        this.modalService.dismissAll();
                        this.stepper.next();
                        console.log(`user created: ${sessionStorage.getItem('username')}`);
                    }
                });
            }
        }
        // not old enough
        else {
            alert('You must be at least 13 years old to register');
            window.location.reload();
        }
    }
    ngOnDestroy() {
        // this.router.navigate(['/'])
        this.sessionState_sub.unsubscribe();
    }
}
RegistrationComponent.ɵfac = function RegistrationComponent_Factory(t) { return new (t || RegistrationComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_4__["SocketService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_session_service__WEBPACK_IMPORTED_MODULE_5__["SessionService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__["NgbModal"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_map_foursquare_service__WEBPACK_IMPORTED_MODULE_7__["FoursquareService"])); };
RegistrationComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: RegistrationComponent, selectors: [["app-registrationpage"]], inputs: { stepper: "stepper" }, features: [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵProvidersFeature"]([_ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__["NgbModalConfig"], _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__["NgbModal"],])], decls: 2, vars: 2, consts: [["ngbAutofocus", "", "class", "modal-body", "id", "form", 3, "formGroup", "ngSubmit", 4, "ngIf"], ["class", "container-fluid", "style", "height: 100%; padding: 1%; background-color: white;", 4, "ngIf"], ["ngbAutofocus", "", "id", "form", 1, "modal-body", 3, "formGroup", "ngSubmit"], ["form", ""], [1, "modal-title"], ["appearance", "outline", "id", "username", 1, "form-group"], ["for", "username"], ["matInput", "", "formControlName", "username", "placeholder", "Enter a Username", "autocomplete", "off"], ["id", "passwordHelpBlock", "class", "text-danger", 4, "ngIf"], ["formGroupName", "passwords", 1, "row"], ["appearance", "outline", 1, "form-group", "col-6"], ["for", "password"], ["matInput", "", "placeholder", "Enter a password", "formControlName", "password", 3, "type"], ["mat-button", "", "type", "button", "mat-icon-button", "", "matSuffix", "", 3, "click"], ["matInput", "", "placeholder", "confirm your password", "formControlName", "confirmPassword", 3, "type"], ["type", "button", "mat-icon-button", "", "matSuffix", "", 3, "click"], ["appearance", "outline", "id", "email", 1, "form-group"], ["for", "email"], ["matInput", "", "formControlName", "email", "placeholder", "Enter a valid Email"], ["id", "emailHelp", 1, "form-text", "text-muted"], [1, "form-inline"], [1, "form-group"], [1, "input-group"], ["id", "calendar", "appearance", "outline"], ["matInput", "", "formControlName", "birthDate", 1, "align-self-center", 3, "matDatepicker", "max"], ["matSuffix", "", 3, "for"], ["startView", "multi-year"], ["picker", ""], [1, ""], ["aria-label", "Select an option", "formControlName", "gender", 1, "row"], ["value", "Male", 1, "col-4"], ["value", "Female", 1, "col-4"], ["value", "Other", 1, "col-4"], ["formControlName", "checkbox", 1, "form-group"], ["for", "terms", 1, "form-check-label"], ["mat-raised-button", "", "color", "primary"], ["id", "passwordHelpBlock", 1, "text-danger"], [1, "container-fluid", 2, "height", "100%", "padding", "1%", "background-color", "white"]], template: function RegistrationComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](0, RegistrationComponent_form_0_Template, 62, 17, "form", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, RegistrationComponent_div_1_Template, 3, 0, "div", 1);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", !ctx.sessionState);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.sessionState);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_8__["NgIf"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormGroupDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_9__["ɵa"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_10__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_10__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_11__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControlName"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_9__["ɵk"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_9__["ɵe"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormGroupName"], _angular_material_button__WEBPACK_IMPORTED_MODULE_12__["MatButton"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_10__["MatSuffix"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_13__["MatIcon"], _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_14__["MatDatepickerInput"], _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_14__["MatDatepickerToggle"], _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_14__["MatDatepicker"], _angular_material_radio__WEBPACK_IMPORTED_MODULE_15__["MatRadioGroup"], _angular_material_radio__WEBPACK_IMPORTED_MODULE_15__["MatRadioButton"], _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_16__["MatCheckbox"]], styles: ["#modal[_ngcontent-%COMP%] {\n  position: absolute;\n  overflow: hidden;\n  z-index: 1;\n}\n\n#username[_ngcontent-%COMP%], #email[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\nmat-form-field[_ngcontent-%COMP%] {\n  margin-bottom: 0;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFwuLlxccmVnaXN0cmF0aW9ucGFnZS5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxVQUFBO0FBQ0Y7O0FBRUE7RUFDRSxXQUFBO0FBQ0Y7O0FBRUE7RUFDRSxnQkFBQTtBQUNGIiwiZmlsZSI6InJlZ2lzdHJhdGlvbnBhZ2UuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIjbW9kYWwge1xyXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICBvdmVyZmxvdzogaGlkZGVuO1xyXG4gIHotaW5kZXg6IDE7XHJcbn1cclxuXHJcbiN1c2VybmFtZSwjZW1haWx7XHJcbiAgd2lkdGg6IDEwMCU7XHJcbn1cclxuXHJcbm1hdC1mb3JtLWZpZWxkIHtcclxuICBtYXJnaW4tYm90dG9tOiAwO1xyXG59Il19 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](RegistrationComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-registrationpage',
                templateUrl: './registrationpage.component.html',
                styleUrls: ['./registrationpage.component.scss'],
                providers: [_ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__["NgbModalConfig"], _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__["NgbModal"],]
            }]
    }], function () { return [{ type: _services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_4__["SocketService"] }, { type: _services_session_service__WEBPACK_IMPORTED_MODULE_5__["SessionService"] }, { type: _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__["NgbModal"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_6__["Router"] }, { type: src_app_services_map_foursquare_service__WEBPACK_IMPORTED_MODULE_7__["FoursquareService"] }]; }, { stepper: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }] }); })();


/***/ }),

/***/ "l3hs":
/*!********************************************!*\
  !*** ./src/app/services/search.service.ts ***!
  \********************************************/
/*! exports provided: SearchService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SearchService", function() { return SearchService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "mrSG");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/environments/environment */ "AytR");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common/http */ "IheW");
/* harmony import */ var _map_foursquare_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./map/foursquare.service */ "PiFF");







class SearchService {
    constructor(HttpClient, foursquareService) {
        this.HttpClient = HttpClient;
        this.foursquareService = foursquareService;
        /**if user is already searchign something */
        this.currentSearch = null;
        this.search = { query: null, content: { users: [], venues: [] } };
        this._searchTab = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"](this.search);
        this.searchTab = this._searchTab.asObservable();
        this.filter = 0;
        this._filterNumber = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"](this.filter);
        this.filterNumber = this._filterNumber.asObservable();
        this.categories = null;
        this._categoryTree = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"](this.categories);
        this.categoryTree = this._categoryTree.asObservable();
        this._categorySet = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"](this.categoriesCollection);
        this.categorySet = this._categorySet.asObservable();
        this.treeValues = {
            tree: [],
            categorySet: new Set()
        };
        this.updateCategories()
            .then((x) => {
            this._categoryTree.next(x);
            this._categorySet.next(this.treeValues.categorySet);
        });
        this.currentSearch = null;
    }
    // looks for venues in the area
    foursquareSearchVenues(query, latLng) {
        return new Promise((resolve, reject) => {
            this.foursquareService.searchVenues(query, latLng.toStringReorder(2))
                .subscribe((result) => {
                resolve(result);
            }, (err) => {
                reject(err);
            });
        });
    }
    /**gets user info with username input, connection to database*/
    userSearch(query) {
        return new Promise((resolve, reject) => {
            this.HttpClient.get(src_environments_environment__WEBPACK_IMPORTED_MODULE_2__["environment"].travelnet.searchUsers, {
                headers: {
                    authorization: localStorage.getItem('token') ? localStorage.getItem('token').toString() : 'monkas',
                },
                params: {
                    user: query
                }
            })
                .subscribe((result) => {
                resolve(result);
            }, (err) => {
                reject(err);
            });
        });
    }
    /** gets venue data with id in the query */
    formatDetails(query) {
        return new Promise((resolve, reject) => {
            this.foursquareService.getDetails(query)
                .subscribe(result => {
                resolve(result);
            }, (err) => {
                reject(err);
            });
        });
    }
    /**combines both user and venue search*/
    mainSearch(query, coord) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            return yield Promise.all([this.foursquareSearchVenues(query, coord), this.userSearch(query)]);
        });
    }
    /**user makes new search in a tab*/
    enterSearch(query, searchType, coord) {
        return new Promise((resolve, reject) => {
            this.resetSearchContent();
            searchType
                .then(result => {
                if (result[0].response.totalResults != 0) {
                    result[0].response.groups[0].items.forEach(venue => {
                        this.search.content.venues.push(venue);
                    });
                }
                else {
                    this.search.content.venues = [];
                }
                if (sessionStorage.getItem('username')) {
                    if (result[1].users) {
                        result[1].users.forEach(user => {
                            this.search.content.users.push(user);
                        });
                    }
                }
                else {
                    this.search.content.users.push({ username: 'warning', name: 'You must be logged in to see users' });
                }
                this.search = ({
                    query: {
                        query,
                        lng: coord.lng,
                        lat: coord.lat
                    },
                    content: this.search.content
                });
                this._searchTab.next(this.search);
                resolve();
            })
                .catch(err => {
                reject(err);
            });
        });
    }
    /**update foursquare categories*/
    updateCategories() {
        return new Promise((resolve, reject) => {
            this.foursquareService.updateCategories()
                .subscribe(x => {
                this.initiateTree(x.response.categories);
                resolve(x.response.categories);
            }, err => {
                console.log(err);
                reject(err);
            });
        });
    }
    /**makes tree leaves checked and creates array containing category id*/
    initiateTree(data) {
        data.forEach((category) => {
            if (category.categories.length === 0) {
                category.checked = true;
                this.treeValues.categorySet.add(category.id);
            }
            else if (category.categories.length !== 0) {
                this.treeValues.categorySet.add(category.id);
                this.initiateTree(category.categories);
            }
        });
    }
    updateCategoryTree(newData) {
        this._categoryTree.next(newData);
    }
    updateCategorySet(newData) {
        this._categorySet.next(newData);
    }
    getSearchResult(search) {
        if (search.type == 'venue') {
            return ('venue: ' + search.name);
        }
        else {
            return ('User: ' + search.name);
        }
    }
    resetSearchContent() {
        this.search.content = { venues: [], users: [] };
        this._searchTab.next(this.search);
    }
    changeFilter(filter) {
        this._filterNumber.next(filter);
    }
    ngOnDestroy() {
        this._searchTab.unsubscribe();
        this._categoryTree.unsubscribe();
        this._categorySet.unsubscribe();
        this._filterNumber.unsubscribe();
    }
}
SearchService.ɵfac = function SearchService_Factory(t) { return new (t || SearchService)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_4__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_map_foursquare_service__WEBPACK_IMPORTED_MODULE_5__["FoursquareService"])); };
SearchService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineInjectable"]({ token: SearchService, factory: SearchService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵsetClassMetadata"](SearchService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_3__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_4__["HttpClient"] }, { type: _map_foursquare_service__WEBPACK_IMPORTED_MODULE_5__["FoursquareService"] }]; }, null); })();


/***/ }),

/***/ "lCy9":
/*!***************************************************************!*\
  !*** ./src/app/components/search-bar/search-bar.component.ts ***!
  \***************************************************************/
/*! exports provided: SearchBarComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SearchBarComponent", function() { return SearchBarComponent; });
/* harmony import */ var _environments_environment_dev__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../../../environments/environment.dev */ "LpW2");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _models_coordinates__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./../../models/coordinates */ "FvPJ");
/* harmony import */ var _city_search_city_search_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./../city-search/city-search.component */ "tuAr");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_models_geocodeResp_model__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! src/app/models/geocodeResp.model */ "ApTs");
/* harmony import */ var src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! src/app/services/map/map.service */ "HYNq");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var src_app_services_search_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! src/app/services/search.service */ "l3hs");
/* harmony import */ var _services_map_openstreetmap_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./../../services/map/openstreetmap.service */ "9W9C");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/input */ "e6WT");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/divider */ "BSbQ");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/tooltip */ "ZFy/");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/select */ "ZTz/");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/core */ "UhP/");























const _c0 = ["searchResultsContainer"];
function SearchBarComponent_button_6_Template(rf, ctx) { if (rf & 1) {
    const _r5 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "button", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function SearchBarComponent_button_6_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r5); const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r4.searchBarForm.get("venueName").setValue(""); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2, "close");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} }
const _c1 = function () { return { standalone: true }; };
function SearchBarComponent_mat_form_field_14_Template(rf, ctx) { if (rf & 1) {
    const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-form-field", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2, "Filter");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "mat-select", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("ngModelChange", function SearchBarComponent_mat_form_field_14_Template_mat_select_ngModelChange_3_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r7); const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r6.defaultFilter = $event; })("selectionChange", function SearchBarComponent_mat_form_field_14_Template_mat_select_selectionChange_3_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r7); const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r8.changeFilter($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "mat-option", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](5, "All");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](6, "mat-option", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](7, "Venues");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](8, "mat-option", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](9, "Users");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngModel", ctx_r1.defaultFilter)("ngModelOptions", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpureFunction0"](2, _c1));
} }
function SearchBarComponent_mat_form_field_15_mat_option_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-option", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const category_r10 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", category_r10.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](category_r10.name);
} }
function SearchBarComponent_mat_form_field_15_Template(rf, ctx) { if (rf & 1) {
    const _r12 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-form-field", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2, "Category");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "mat-select", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("valueChange", function SearchBarComponent_mat_form_field_15_Template_mat_select_valueChange_3_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r12); const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r11.defaultCategory = $event; });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "mat-option", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](5, "All");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](6, SearchBarComponent_mat_form_field_15_mat_option_6_Template, 2, 2, "mat-option", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", ctx_r2.defaultCategory);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r2.categories);
} }
function SearchBarComponent_router_outlet_20_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "router-outlet");
} }
class SearchBarComponent {
    constructor(MapService, router, SearchService, ActivatedRoute, OpenstreetmapService) {
        this.MapService = MapService;
        this.router = router;
        this.SearchService = SearchService;
        this.ActivatedRoute = ActivatedRoute;
        this.OpenstreetmapService = OpenstreetmapService;
        this.submission = new _angular_core__WEBPACK_IMPORTED_MODULE_4__["EventEmitter"]();
        this.isChild = false;
        this.loading = false;
        this.fakeCenter = null;
        this.clickedOption = null;
        this.filterOptions = {
            0: '...',
            1: 'Venues',
            2: 'Users'
        };
        this.defaultFilter = '0';
        this.defaultCategory = 'All';
    }
    ngOnInit() {
        this.searchBarForm = new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroup"]({
            venueName: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](null, [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].minLength(1), _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].maxLength(25)])
        });
        this.returnTab_sub = this.SearchService.searchTab.subscribe((tab) => {
            this.openTab = tab;
        });
        this.fakeCenter_sub = this.MapService.fakeCenter.subscribe((coord) => {
            this.fakeCenter = coord ? coord : _environments_environment_dev__WEBPACK_IMPORTED_MODULE_0__["environment"].montrealCoord;
        });
        this.foursquareCategory_sub = this.SearchService.categoryTree.subscribe((cats) => {
            this.categories = cats;
        });
    }
    ngAfterViewInit() {
        // for coordinates of city search
        this.clickedOption_sub = this.CitySearchComponent.clickedOption.subscribe((city) => {
            if (city) {
                this.clickedOption = city;
            }
            else {
                this.clickedOption = null;
            }
        });
        this.ActivatedRoute.queryParams.subscribe((params) => {
            // set param to montreal if no location param
            if (!params.lng) {
                // this.CitySearchComponent.myControl.patchValue('Montreal, Canada')
                this.CitySearchComponent._clickedOptionLocal = new src_app_models_geocodeResp_model__WEBPACK_IMPORTED_MODULE_5__["geocodeResponseModel"](this.CitySearchComponent.myControl.value, [this.fakeCenter.lng, this.fakeCenter.lat]);
            }
            else {
                this.OpenstreetmapService.reverseSearch(params.lng, params.lat).subscribe((response) => {
                    if (response.features[0]) {
                        this.CitySearchComponent.myControl.patchValue(response.features[0].properties.address.city + ',' + response.features[0].properties.address.country);
                    }
                });
            }
            if (params.query) {
                this.searchBarForm.get('venueName').setValue(params.query);
                // if url contains query
                if (!this.SearchService.currentSearch) {
                    this.loading = true;
                    const coord = params.lng ? new _models_coordinates__WEBPACK_IMPORTED_MODULE_2__["CustomCoordinates"](params.lng, params.lat) : this.MapService.getCenter();
                    this.SearchService.enterSearch(params.query, this.SearchService.mainSearch(params.query, coord), coord)
                        .finally(() => {
                        this.loading = false;
                    });
                }
            }
        });
        if (this.SearchService.currentSearch) {
            this.searchBarForm.get('venueName').setValue(this.SearchService.currentSearch.query);
            if (this.SearchService.currentSearch.lat) {
                // get name of searched city
            }
        }
    }
    onSubmit() {
        if (this.searchBarForm.valid && this.CitySearchComponent.myControl.valid) {
            this.submission.emit();
            const coord = this.clickedOption ? new _models_coordinates__WEBPACK_IMPORTED_MODULE_2__["CustomCoordinates"](this.clickedOption.content.geometry.coordinates[0], this.clickedOption.content.geometry.coordinates[1]) : this.fakeCenter;
            this.SearchService.enterSearch(this.searchBarForm.get('venueName').value, this.SearchService.mainSearch(this.searchBarForm.get('venueName').value, coord), coord)
                .then(() => {
                this.SearchService.currentSearch = { query: this.searchBarForm.get('venueName').value, lng: coord.lng, lat: coord.lat, category: this.defaultCategory };
                this.router.navigate(['search'], { queryParams: { query: this.searchBarForm.get('venueName').value, lng: coord.lng, lat: coord.lat, category: this.defaultCategory } });
            })
                .catch(err => {
                console.log(err);
            });
        }
    }
    /** all|venues|users */
    changeFilter(filter) {
        this.defaultFilter = filter.value;
        this.defaultCategory = this.filterOptions[filter.value];
        this.SearchService.changeFilter(parseInt(filter.value));
    }
    ngOnDestroy() {
        this.returnTab_sub.unsubscribe();
        this.fakeCenter_sub.unsubscribe();
        this.clickedOption_sub.unsubscribe();
    }
}
SearchBarComponent.ɵfac = function SearchBarComponent_Factory(t) { return new (t || SearchBarComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_6__["MapService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](src_app_services_search_service__WEBPACK_IMPORTED_MODULE_8__["SearchService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_map_openstreetmap_service__WEBPACK_IMPORTED_MODULE_9__["OpenstreetmapService"])); };
SearchBarComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({ type: SearchBarComponent, selectors: [["app-search-bar"]], viewQuery: function SearchBarComponent_Query(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵviewQuery"](_c0, true);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵviewQuery"](_city_search_city_search_component__WEBPACK_IMPORTED_MODULE_3__["CitySearchComponent"], true);
    } if (rf & 2) {
        var _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵloadQuery"]()) && (ctx.div = _t.first);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵloadQuery"]()) && (ctx.CitySearchComponent = _t.first);
    } }, inputs: { isChild: "isChild" }, outputs: { submission: "submission" }, decls: 21, vars: 8, consts: [[1, "container-fluid", "row", 2, "min-width", "100%", "background-color", "rgba(255, 255, 255, 0.9)", "margin", "0", "padding", "0", 3, "formGroup", "ngSubmit"], [1, "col", "row", "mr-auto", 2, "padding-top", "1em", "margin", "0", "padding-right", "0", "padding-left", "0"], ["appearance", "outline", 1, "col", "align-self-center", 2, "padding-left", "0.5em", "padding-right", "0"], ["matInput", "", "type", "text", "placeholder", "Ex: restaurant", "aria-label", "Search", "autocomplete", "off", "formControlName", "venueName"], ["mat-button", "", "matSuffix", "", "mat-icon-button", "", "aria-label", "Clear", "type", "button", 3, "click", 4, "ngIf"], ["fas", "", "fa-search", "", "aria-hidden", "true"], [1, "align-self-center"], ["appearance", "outline", "placeholder", "Region", 1, "col", "align-self-center", 2, "min-width", "200px", "padding-right", "0.5em", "padding-left", "0", 3, "clearOnSearch", "getFakeCenterCity"], ["vertical", "true", 2, "margin-bottom", "1em"], ["class", "col-auto align-self-center", "style", "max-width: 125px; padding-left: 0.5em;", 4, "ngIf"], ["class", "col-auto align-self-center", "style", "max-width: 125px; padding-left: 0.5em;", "appearance", "outline", 4, "ngIf"], [1, "col-auto", 2, "padding-top", "1em"], ["mat-raised-button", "", "type", "submit", "color", "primary", "matTooltip", "select a city to search in or drag the area you want to search to the center of the visible map", "matTooltipShowDelay", "800", 1, "align-self-center"], [4, "ngIf"], ["mat-button", "", "matSuffix", "", "mat-icon-button", "", "aria-label", "Clear", "type", "button", 3, "click"], [1, "col-auto", "align-self-center", 2, "max-width", "125px", "padding-left", "0.5em"], [3, "ngModel", "ngModelOptions", "ngModelChange", "selectionChange"], ["value", "0"], ["value", "1"], ["value", "2"], ["appearance", "outline", 1, "col-auto", "align-self-center", 2, "max-width", "125px", "padding-left", "0.5em"], [3, "value", "valueChange"], ["value", "All"], [3, "value", 4, "ngFor", "ngForOf"], [3, "value"]], template: function SearchBarComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "form", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("ngSubmit", function SearchBarComponent_Template_form_ngSubmit_0_listener() { return ctx.onSubmit(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "span", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "mat-form-field", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](5, "input", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](6, SearchBarComponent_button_6_Template, 3, 0, "button", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](7, "i", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](8, " \u00A0 \u00A0 ");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "p", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](10, "in");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](11, " \u00A0 \u00A0 ");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](12, "app-city-search", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](13, "mat-divider", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](14, SearchBarComponent_mat_form_field_14_Template, 10, 3, "mat-form-field", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](15, SearchBarComponent_mat_form_field_15_Template, 7, 2, "mat-form-field", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](16, "div", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](17, "button", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](18, "mat-icon");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](19, "search");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](20, SearchBarComponent_router_outlet_20_Template, 1, 0, "router-outlet", 13);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("formGroup", ctx.searchBarForm);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"]("Search for ", ctx.defaultCategory === "All" ? "..." : ctx.defaultCategory, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.searchBarForm.get("venueName").value != "");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("clearOnSearch", false)("getFakeCenterCity", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", !ctx.isChild);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.isChild);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", !ctx.isChild);
    } }, directives: [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroupDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_10__["ɵa"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_11__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_11__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_12__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControlName"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_10__["ɵk"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_10__["ɵe"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["NgIf"], _city_search_city_search_component__WEBPACK_IMPORTED_MODULE_3__["CitySearchComponent"], _angular_material_divider__WEBPACK_IMPORTED_MODULE_14__["MatDivider"], _angular_material_button__WEBPACK_IMPORTED_MODULE_15__["MatButton"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_16__["MatTooltip"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_17__["MatIcon"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_11__["MatSuffix"], _angular_material_select__WEBPACK_IMPORTED_MODULE_18__["MatSelect"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgModel"], _angular_material_core__WEBPACK_IMPORTED_MODULE_19__["MatOption"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["NgForOf"], _angular_router__WEBPACK_IMPORTED_MODULE_7__["RouterOutlet"]], styles: ["mat-icon[_ngcontent-%COMP%]:hover {\n  cursor: pointer;\n}\n\nbutton[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n\n  .mat-tooltip {\n  font-size: 1em !important;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxzZWFyY2gtYmFyLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0ksZUFBQTtBQUNKOztBQUVBO0VBQ0ksYUFBQTtBQUNKOztBQUVBO0VBQ0kseUJBQUE7QUFDSiIsImZpbGUiOiJzZWFyY2gtYmFyLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsibWF0LWljb246aG92ZXIge1xyXG4gICAgY3Vyc29yOiBwb2ludGVyO1xyXG59XHJcblxyXG5idXR0b246Zm9jdXMge1xyXG4gICAgb3V0bGluZTogbm9uZTtcclxufVxyXG5cclxuOjpuZy1kZWVwIC5tYXQtdG9vbHRpcCB7XHJcbiAgICBmb250LXNpemU6IDFlbSAhaW1wb3J0YW50XHJcbn0iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵsetClassMetadata"](SearchBarComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Component"],
        args: [{
                selector: 'app-search-bar',
                templateUrl: './search-bar.component.html',
                styleUrls: ['./search-bar.component.scss']
            }]
    }], function () { return [{ type: src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_6__["MapService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_7__["Router"] }, { type: src_app_services_search_service__WEBPACK_IMPORTED_MODULE_8__["SearchService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_7__["ActivatedRoute"] }, { type: _services_map_openstreetmap_service__WEBPACK_IMPORTED_MODULE_9__["OpenstreetmapService"] }]; }, { submission: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Output"]
        }], isChild: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"]
        }], div: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["ViewChild"],
            args: ['searchResultsContainer']
        }], CitySearchComponent: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["ViewChild"],
            args: [_city_search_city_search_component__WEBPACK_IMPORTED_MODULE_3__["CitySearchComponent"]]
        }] }); })();


/***/ }),

/***/ "lumE":
/*!**************************************************************************!*\
  !*** ./src/app/components/chatsystem/chatwidget/chatwidget.component.ts ***!
  \**************************************************************************/
/*! exports provided: ChatwidgetComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChatwidgetComponent", function() { return ChatwidgetComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/chatsystem/friendlist.service */ "+7u6");
/* harmony import */ var src_app_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/services/chatsystem/socket.service */ "QeH8");
/* harmony import */ var _services_session_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../services/session.service */ "IfdK");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");








const _c0 = ["textarea"];
function ChatwidgetComponent_div_0_div_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "div", 11, 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function ChatwidgetComponent_div_0_Template(rf, ctx) { if (rf & 1) {
    const _r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function ChatwidgetComponent_div_0_Template_div_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r5); const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r4.toggleChatWidget(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](2, ChatwidgetComponent_div_0_div_2_Template, 4, 0, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "form", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("submit", function ChatwidgetComponent_div_0_Template_form_submit_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r5); const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵreference"](7); const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r6.sendMessage(_r2.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "textarea", 7, 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("ngModelChange", function ChatwidgetComponent_div_0_Template_textarea_ngModelChange_6_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r5); const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r7.typeArea = $event; })("keydown", function ChatwidgetComponent_div_0_Template_textarea_keydown_6_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r5); const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r8.onKey($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](8, "input", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("innerText", ctx_r0.sessionRoomName);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r0.sessionState);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngModel", ctx_r0.typeArea);
} }
class ChatwidgetComponent {
    constructor(friendlistService, renderer, socketService, sessionService) {
        this.friendlistService = friendlistService;
        this.renderer = renderer;
        this.socketService = socketService;
        this.sessionService = sessionService;
        this.typeArea = '';
        this.username = sessionStorage.getItem('username');
    }
    ngOnInit() {
        // subscribe to Observables
        this.sessionSub = this.sessionService.sessionState.subscribe((isLoggedIn) => {
            this.sessionState = isLoggedIn;
        });
        this.roomSub = this.friendlistService.roomModel.subscribe((room) => {
            this.roomModel = room;
        });
        this.sessionRoomName = this.sessionService.getRoomName(this.roomName);
        // pull Chatroom content from backend
        this.socketService.emit('initChatroom', { id: this.roomId, username: this.username }, (data) => {
            if (data.err) {
                console.log(data.err);
            }
            else {
                data.messages.forEach((message) => {
                    const ul = this.renderer.createElement('ul');
                    ul.innerHTML = `${message.sender === this.username ? 'you' : message.sender}: ${message.content}`;
                    this.renderer.appendChild(this.div.nativeElement, ul);
                });
            }
        });
        this.friendlistService.selectChatwidget(this.roomId);
        // listen for messages & add display them
        this.socketService.listen('message_res').subscribe((data) => {
            if (this.roomId == data.res.roomId) {
                const ul = this.renderer.createElement('ul');
                ul.innerHTML = `${data.res.sender === this.username ? 'you' : data.res.sender}: ${data.res.content}`;
                this.renderer.appendChild(this.div.nativeElement, ul);
                this.typeArea = ``;
            }
            else {
            }
        });
        // listen for notifications
        this.socketService.listen('notification').subscribe((data) => {
        });
    }
    // look for enter button
    onKey(event) {
        if (event.key == 'Enter') {
            event.preventDefault();
            this.sendMessage(this.typeArea);
            this.typeArea = '';
        }
    }
    // send message with socket
    sendMessage(data) {
        if (data != '') {
            this.socketService.emit('message', { roomId: this.roomId, sender: this.username, content: data });
        }
    }
    toggleChatWidget() {
        this.friendlistService.getRoomWidget(this.roomId);
        this.friendlistService.toggleChatWidget(this.roomModel);
        this.ngOnDestroy();
    }
    ngOnDestroy() {
        this.socketService.remove('message_res');
        this.socketService.remove('notification');
        this.roomSub.unsubscribe();
        this.sessionSub.unsubscribe();
    }
}
ChatwidgetComponent.ɵfac = function ChatwidgetComponent_Factory(t) { return new (t || ChatwidgetComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__["FriendlistService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_2__["SocketService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_session_service__WEBPACK_IMPORTED_MODULE_3__["SessionService"])); };
ChatwidgetComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: ChatwidgetComponent, selectors: [["app-chatwidget"]], viewQuery: function ChatwidgetComponent_Query(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵviewQuery"](_c0, true);
    } if (rf & 2) {
        var _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵloadQuery"]()) && (ctx.div = _t.first);
    } }, inputs: { roomName: "roomName", roomId: "roomId" }, decls: 1, vars: 1, consts: [["id", "main", "class", "col-auto", 4, "ngIf"], ["id", "main", 1, "col-auto"], ["aria-readonly", "true", 1, "space", "rounded-top", 3, "innerText", "click"], ["class", "text-wrap", "id", "chatbody", 4, "ngIf"], [1, "space", "rounded-bottom"], ["autocomplete", "off", 1, "container-fluid", 3, "submit"], [1, "row"], ["name", "ngModel", "type", "textarea", 1, "col-auto", 3, "ngModel", "ngModelChange", "keydown"], ["msg", "ngModel"], ["id", "submit", "type", "submit", "value", "Send", 1, "btn", "btn-primary", "col"], ["id", "chatbody", 1, "text-wrap"], ["id", "textarea", 1, "text-wrap"], ["textarea", ""]], template: function ChatwidgetComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](0, ChatwidgetComponent_div_0_Template, 9, 3, "div", 0);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.sessionState);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_4__["NgIf"], _angular_forms__WEBPACK_IMPORTED_MODULE_5__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_5__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_5__["NgForm"], _angular_forms__WEBPACK_IMPORTED_MODULE_5__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_5__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_5__["NgModel"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_6__["ɵk"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_6__["ɵe"]], styles: ["ul[_ngcontent-%COMP%] {\n  text-align: left;\n  padding-left: 0em;\n}\n\n#chatbody[_ngcontent-%COMP%] {\n  height: 250px;\n  background-color: rgba(255, 255, 255, 0.8);\n  border: medium;\n  padding-left: 5px;\n  padding-right: 5px;\n  padding-top: 0;\n  padding-bottom: 0;\n  overflow-y: auto;\n  overflow-x: hidden;\n  display: flex;\n  flex-direction: column-reverse;\n}\n\n.space.rounded-top[_ngcontent-%COMP%] {\n  padding-left: 5px;\n  padding-top: 2px;\n  padding-bottom: 2px;\n}\n\n.space[_ngcontent-%COMP%] {\n  height: 30px;\n  background-color: white;\n}\n\n.row[_ngcontent-%COMP%]   .container-fluid[_ngcontent-%COMP%] {\n  margin: 0px;\n}\n\n#main[_ngcontent-%COMP%] {\n  z-index: 1 !important;\n  width: 250px;\n  bottom: 2vh;\n}\n\n#submit[_ngcontent-%COMP%] {\n  right: 0px;\n  padding: 0;\n  width: 50px;\n  opacity: 1;\n  border-radius: 0px;\n}\n\ntextarea[_ngcontent-%COMP%] {\n  width: 145px;\n  overflow: hidden;\n  resize: none;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFwuLlxcY2hhdHdpZGdldC5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGdCQUFBO0VBQ0EsaUJBQUE7QUFDRjs7QUFFQTtFQUNFLGFBQUE7RUFDQSwwQ0FBQTtFQUNBLGNBQUE7RUFDQSxpQkFBQTtFQUNBLGtCQUFBO0VBQ0EsY0FBQTtFQUNBLGlCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxrQkFBQTtFQUNBLGFBQUE7RUFDQSw4QkFBQTtBQUNGOztBQUVBO0VBQ0UsaUJBQUE7RUFDQSxnQkFBQTtFQUNBLG1CQUFBO0FBQ0Y7O0FBRUE7RUFDRSxZQUFBO0VBQ0EsdUJBQUE7QUFDRjs7QUFFQTtFQUNFLFdBQUE7QUFDRjs7QUFFQTtFQUNFLHFCQUFBO0VBQ0EsWUFBQTtFQUNBLFdBQUE7QUFDRjs7QUFFQTtFQUNFLFVBQUE7RUFDQSxVQUFBO0VBQ0EsV0FBQTtFQUNBLFVBQUE7RUFDQSxrQkFBQTtBQUNGOztBQUVBO0VBQ0UsWUFBQTtFQUNBLGdCQUFBO0VBQ0EsWUFBQTtBQUNGIiwiZmlsZSI6ImNoYXR3aWRnZXQuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyJ1bCB7XHJcbiAgdGV4dC1hbGlnbjogbGVmdDtcclxuICBwYWRkaW5nLWxlZnQ6IDBlbTtcclxufVxyXG5cclxuI2NoYXRib2R5IHtcclxuICBoZWlnaHQ6IDI1MHB4O1xyXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LDI1NSwyNTUsIDAuOCk7XHJcbiAgYm9yZGVyOiBtZWRpdW07XHJcbiAgcGFkZGluZy1sZWZ0OiA1cHg7XHJcbiAgcGFkZGluZy1yaWdodDogNXB4O1xyXG4gIHBhZGRpbmctdG9wOiAwO1xyXG4gIHBhZGRpbmctYm90dG9tOiAwO1xyXG4gIG92ZXJmbG93LXk6IGF1dG87XHJcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbi1yZXZlcnNlO1xyXG59XHJcblxyXG4uc3BhY2Uucm91bmRlZC10b3Age1xyXG4gIHBhZGRpbmctbGVmdDogNXB4O1xyXG4gIHBhZGRpbmctdG9wOiAycHg7XHJcbiAgcGFkZGluZy1ib3R0b206IDJweDtcclxufVxyXG5cclxuLnNwYWNlIHtcclxuICBoZWlnaHQ6IDMwcHg7XHJcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsMjU1LDI1NSwgMSk7XHJcbn1cclxuXHJcbi5yb3cgLmNvbnRhaW5lci1mbHVpZCB7XHJcbiAgbWFyZ2luOiAwcHg7XHJcbn1cclxuXHJcbiNtYWluIHtcclxuICB6LWluZGV4OiAxICFpbXBvcnRhbnQ7XHJcbiAgd2lkdGg6IDI1MHB4O1xyXG4gIGJvdHRvbTogMnZoO1xyXG59XHJcblxyXG4jc3VibWl0IHtcclxuICByaWdodDogMHB4O1xyXG4gIHBhZGRpbmc6IDA7XHJcbiAgd2lkdGg6IDUwcHg7XHJcbiAgb3BhY2l0eTogMTtcclxuICBib3JkZXItcmFkaXVzOiAwcHg7XHJcbn1cclxuXHJcbnRleHRhcmVhIHtcclxuICB3aWR0aDogMTQ1cHg7XHJcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICByZXNpemU6IG5vbmU7XHJcbn1cclxuIl19 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ChatwidgetComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-chatwidget',
                templateUrl: './chatwidget.component.html',
                styleUrls: ['./chatwidget.component.scss']
            }]
    }], function () { return [{ type: src_app_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__["FriendlistService"] }, { type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"] }, { type: src_app_services_chatsystem_socket_service__WEBPACK_IMPORTED_MODULE_2__["SocketService"] }, { type: _services_session_service__WEBPACK_IMPORTED_MODULE_3__["SessionService"] }]; }, { roomName: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }], roomId: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }], div: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"],
            args: ['textarea']
        }] }); })();


/***/ }),

/***/ "mqv/":
/*!********************************************************!*\
  !*** ./src/app/components/tabs/home/home.component.ts ***!
  \********************************************************/
/*! exports provided: HomeComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HomeComponent", function() { return HomeComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_http_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/http.service */ "N+K7");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _add_post_add_post_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../add-post/add-post.component */ "qF1r");
/* harmony import */ var _display_posts_display_posts_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../display-posts/display-posts.component */ "D4op");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");








function HomeComponent_div_0_div_3_Template(rf, ctx) { if (rf & 1) {
    const _r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "button", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function HomeComponent_div_0_div_3_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r4); const username_r2 = ctx.$implicit; const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r3.getProfile(username_r2); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const username_r2 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", username_r2, " ");
} }
function HomeComponent_div_0_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](3, HomeComponent_div_0_div_3_Template, 3, 1, "div", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"]("Followers : ", ctx_r0.user.followers.length, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx_r0.user.followers);
} }
class HomeComponent {
    constructor(HttpService, Router) {
        this.HttpService = HttpService;
        this.Router = Router;
    }
    ngOnInit() {
        // get user info
        this.HttpService.get('/user', null).then((res) => {
            this.user = res.user[0];
        });
    }
    getProfile(username) {
        this.Router.navigate(['/search/user/' + username]);
    }
}
HomeComponent.ɵfac = function HomeComponent_Factory(t) { return new (t || HomeComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_http_service__WEBPACK_IMPORTED_MODULE_1__["HttpService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"])); };
HomeComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: HomeComponent, selectors: [["app-home"]], decls: 3, vars: 1, consts: [[4, "ngIf"], [4, "ngFor", "ngForOf"], ["mat-raised-button", "", 3, "click"]], template: function HomeComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](0, HomeComponent_div_0_Template, 4, 2, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "app-add-post");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "app-display-posts");
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.user);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_3__["NgIf"], _add_post_add_post_component__WEBPACK_IMPORTED_MODULE_4__["AddPostComponent"], _display_posts_display_posts_component__WEBPACK_IMPORTED_MODULE_5__["DisplayPostsComponent"], _angular_common__WEBPACK_IMPORTED_MODULE_3__["NgForOf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_6__["MatButton"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJob21lLmNvbXBvbmVudC5zY3NzIn0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](HomeComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-home',
                templateUrl: './home.component.html',
                styleUrls: ['./home.component.scss']
            }]
    }], function () { return [{ type: src_app_services_http_service__WEBPACK_IMPORTED_MODULE_1__["HttpService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] }]; }, null); })();


/***/ }),

/***/ "qF1r":
/*!***********************************************************!*\
  !*** ./src/app/components/add-post/add-post.component.ts ***!
  \***********************************************************/
/*! exports provided: AddPostComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AddPostComponent", function() { return AddPostComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_cdk_keycodes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/cdk/keycodes */ "Ht+U");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _mime_type_validator__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./mime-type.validator */ "ciVQ");
/* harmony import */ var _city_search_city_search_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../city-search/city-search.component */ "tuAr");
/* harmony import */ var src_app_services_add_post_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! src/app/services/add-post.service */ "woXb");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/card */ "PDjf");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/progress-spinner */ "pu8Q");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/input */ "e6WT");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_material_chips__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/chips */ "f44v");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");



















function AddPostComponent_mat_spinner_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "mat-spinner");
} }
function AddPostComponent_form_2_mat_error_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "Please enter a post title.");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function AddPostComponent_form_2_mat_error_7_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "Please enter something");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function AddPostComponent_form_2_div_13_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "img", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("src", ctx_r5.imagePreview, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"])("alt", ctx_r5.form.value.title);
} }
function AddPostComponent_form_2_mat_chip_17_mat_icon_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-icon", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "cancel");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function AddPostComponent_form_2_mat_chip_17_Template(rf, ctx) { if (rf & 1) {
    const _r11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-chip", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("removed", function AddPostComponent_form_2_mat_chip_17_Template_mat_chip_removed_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r11); const tag_r8 = ctx.$implicit; const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r10.removeTag(tag_r8); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](2, AddPostComponent_form_2_mat_chip_17_mat_icon_2_Template, 2, 0, "mat-icon", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const tag_r8 = ctx.$implicit;
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("selectable", ctx_r7.selectable)("removable", ctx_r7.removable);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", tag_r8, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r7.removable);
} }
function AddPostComponent_form_2_Template(rf, ctx) { if (rf & 1) {
    const _r13 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "form", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("submit", function AddPostComponent_form_2_Template_form_submit_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r13); const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r12.onSavePost(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-form-field");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "input", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](3, AddPostComponent_form_2_mat_error_3_Template, 2, 0, "mat-error", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "app-city-search", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("locationAdded", function AddPostComponent_form_2_Template_app_city_search_locationAdded_4_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r13); const ctx_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r14.onAddLocation($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "mat-form-field");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](6, "textarea", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](7, AddPostComponent_form_2_mat_error_7_Template, 2, 0, "mat-error", 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](9, "button", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function AddPostComponent_form_2_Template_button_click_9_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r13); const _r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵreference"](12); return _r4.click(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](10, "Pick Image");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "input", 7, 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("change", function AddPostComponent_form_2_Template_input_change_11_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r13); const ctx_r16 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r16.onImagePicked($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](13, AddPostComponent_form_2_div_13_Template, 2, 2, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](14, "mat-form-field", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](15, "mat-chip-list", 11, 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](17, AddPostComponent_form_2_mat_chip_17_Template, 3, 4, "mat-chip", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](18, "input", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("matChipInputTokenEnd", function AddPostComponent_form_2_Template_input_matChipInputTokenEnd_18_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r13); const ctx_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r17.addTag($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](19, "hr");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](20, "button", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](21, "Save Post");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const _r6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵreference"](16);
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("formGroup", ctx_r1.form);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r1.form.get("title").invalid);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("getFakeCenterCity", true)("placeholder", "Region");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r1.form.get("content").invalid);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r1.imagePreview !== "" && ctx_r1.imagePreview && ctx_r1.form.get("image").valid);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx_r1.tags);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("matChipInputFor", _r6)("matChipInputSeparatorKeyCodes", ctx_r1.separatorKeysCodes)("matChipInputAddOnBlur", ctx_r1.addOnBlur);
} }
class AddPostComponent {
    constructor(postsService, route) {
        this.postsService = postsService;
        this.route = route;
        this.enteredTitle = '';
        this.enteredContent = '';
        this.isLoading = false;
        this.mode = 'create';
        // tags
        this.visible = true;
        this.selectable = true;
        this.removable = true;
        this.addOnBlur = true;
        this.separatorKeysCodes = [_angular_cdk_keycodes__WEBPACK_IMPORTED_MODULE_1__["ENTER"], _angular_cdk_keycodes__WEBPACK_IMPORTED_MODULE_1__["COMMA"]];
        this.tags = [];
        this.clickedOption = null;
        this.checkedOnce = false;
    }
    ngOnInit() {
        this.form = new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormGroup"]({
            title: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, { validators: [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].minLength(3)] }),
            location: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, { validators: [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required] }),
            content: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, { validators: [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required] }),
            tags: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, { validators: [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required] }),
            image: new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null, {
                validators: [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required],
                asyncValidators: [_mime_type_validator__WEBPACK_IMPORTED_MODULE_3__["mimeType"]]
            })
        });
        this.route.paramMap.subscribe((paramMap) => {
            if (paramMap.has('postId')) {
                this.mode = 'edit';
                this.postId = paramMap.get('postId');
                this.isLoading = true;
                this.postsService.getPost(this.postId).subscribe(postData => {
                    this.isLoading = false;
                    this.post = {
                        _id: postData._id,
                        author: postData.author,
                        date: postData.date,
                        location: postData.location,
                        likes: postData.likes,
                        title: postData.title,
                        content: postData.content,
                        imagePath: postData.imagePath,
                        tags: postData.tags,
                        comments: postData.comments,
                    };
                    this.form.setValue({
                        location: this.post.location,
                        title: this.post.title,
                        content: this.post.content,
                        image: this.post.imagePath,
                        tags: this.post.tags,
                    });
                    this.imagePreview = this.post.imagePath;
                    this.tags = this.post.tags;
                    this.location = this.post.location;
                });
            }
            else {
                this.mode = 'create';
                this.postId = null;
            }
        });
    }
    ngAfterViewChecked() {
        if (this.CitySearchComponent && !this.checkedOnce) {
            this.clickedOption_sub = this.CitySearchComponent.clickedOption.subscribe((city) => {
                if (city) {
                    this.clickedOption = city;
                }
                else {
                    this.clickedOption = null;
                }
            });
        }
        else if (!this.CitySearchComponent) {
        }
        else {
            this.checkedOnce = true;
        }
    }
    onImagePicked(event) {
        const file = event.target.files[0];
        this.form.patchValue({ image: file });
        this.form.get('image').updateValueAndValidity();
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview = reader.result;
        };
        reader.readAsDataURL(file);
    }
    onSavePost() {
        this.onAddLocation(this.clickedOption.name);
        if (this.form.invalid) {
            return;
        }
        this.isLoading = true;
        if (this.mode === 'create') {
            const newPost = {
                date: new Date().toLocaleString(),
                location: this.form.value.location,
                author: sessionStorage.getItem('username'),
                title: this.form.value.title,
                content: this.form.value.content,
                image: this.form.value.image,
                tags: this.form.value.tags,
            };
            this.postsService.addPost(newPost);
        }
        else {
            this.postsService.updatePost({
                _id: this.postId,
                date: this.post.date,
                location: this.form.value.location,
                author: sessionStorage.getItem('username'),
                likes: this.post.likes,
                title: this.form.value.title,
                content: this.form.value.content,
                image: this.form.value.image,
                tags: this.form.value.tags,
                comments: this.post.comments
            });
        }
        this.form.reset();
        this.isLoading = false;
    }
    addTag(event) {
        const input = event.input;
        const value = event.value;
        // Add a tag
        if ((value || '').trim()) {
            this.tags.push(value.trim());
        }
        // Reset the input value
        if (input) {
            input.value = '';
        }
        this.form.patchValue({ tags: this.tags });
        this.form.get('tags').updateValueAndValidity();
    }
    removeTag(tag) {
        const index = this.tags.indexOf(tag);
        if (index >= 0) {
            this.tags.splice(index, 1);
        }
        this.form.patchValue({ tags: this.tags });
        this.form.get('tags').updateValueAndValidity();
    }
    onAddLocation(location) {
        this.location = location;
        this.form.patchValue({ location });
        this.form.get('location').updateValueAndValidity();
    }
    ngOnDestroy() {
        this.clickedOption_sub.unsubscribe();
    }
}
AddPostComponent.ɵfac = function AddPostComponent_Factory(t) { return new (t || AddPostComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_add_post_service__WEBPACK_IMPORTED_MODULE_5__["AddPostService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["ActivatedRoute"])); };
AddPostComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: AddPostComponent, selectors: [["app-add-post"]], viewQuery: function AddPostComponent_Query(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵviewQuery"](_city_search_city_search_component__WEBPACK_IMPORTED_MODULE_4__["CitySearchComponent"], true);
    } if (rf & 2) {
        var _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵloadQuery"]()) && (ctx.CitySearchComponent = _t.first);
    } }, decls: 3, vars: 2, consts: [[4, "ngIf"], [3, "formGroup", "submit", 4, "ngIf"], [3, "formGroup", "submit"], ["matInput", "", "type", "text", "formControlName", "title", "placeholder", "Post Title"], [3, "getFakeCenterCity", "placeholder", "locationAdded"], ["matInput", "", "rows", "4", "formControlName", "content", "placeholder", "Post Content"], ["mat-stroked-button", "", "type", "button", 3, "click"], ["type", "file", 1, "hidden", 3, "change"], ["filePicker", ""], ["class", "image-preview", 4, "ngIf"], [1, "example-chip-list"], ["aria-label", "tag selection"], ["chipList", ""], [3, "selectable", "removable", "removed", 4, "ngFor", "ngForOf"], ["placeholder", "add a tag...", 3, "matChipInputFor", "matChipInputSeparatorKeyCodes", "matChipInputAddOnBlur", "matChipInputTokenEnd"], ["mat-raised-button", "", "color", "accent", "type", "submit"], [1, "image-preview"], [3, "src", "alt"], [3, "selectable", "removable", "removed"], ["matChipRemove", "", 4, "ngIf"], ["matChipRemove", ""]], template: function AddPostComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-card");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, AddPostComponent_mat_spinner_1_Template, 1, 0, "mat-spinner", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](2, AddPostComponent_form_2_Template, 22, 10, "form", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.isLoading);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", !ctx.isLoading);
    } }, directives: [_angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCard"], _angular_common__WEBPACK_IMPORTED_MODULE_8__["NgIf"], _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_9__["MatSpinner"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormGroupDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_10__["ɵa"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_11__["MatFormField"], _angular_material_input__WEBPACK_IMPORTED_MODULE_12__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControlName"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_10__["ɵk"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_10__["ɵe"], _city_search_city_search_component__WEBPACK_IMPORTED_MODULE_4__["CitySearchComponent"], _angular_material_button__WEBPACK_IMPORTED_MODULE_13__["MatButton"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_10__["ɵi"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_10__["ɵj"], _angular_material_chips__WEBPACK_IMPORTED_MODULE_14__["MatChipList"], _angular_common__WEBPACK_IMPORTED_MODULE_8__["NgForOf"], _angular_material_chips__WEBPACK_IMPORTED_MODULE_14__["MatChipInput"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_11__["MatError"], _angular_material_chips__WEBPACK_IMPORTED_MODULE_14__["MatChip"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_15__["MatIcon"], _angular_material_chips__WEBPACK_IMPORTED_MODULE_14__["MatChipRemove"]], styles: ["mat-form-field[_ngcontent-%COMP%], textarea[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\nmat-spinner[_ngcontent-%COMP%] {\n  margin: auto;\n}\n\n.hidden[_ngcontent-%COMP%] {\n  visibility: hidden;\n}\n\n.image-preview[_ngcontent-%COMP%] {\n  height: 5rem;\n  margin: 1rem 0;\n}\n\n.image-preview[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  height: 100%;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxhZGQtcG9zdC5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7RUFFRSxXQUFBO0FBQ0Y7O0FBRUE7RUFDRSxZQUFBO0FBQ0Y7O0FBRUE7RUFDRSxrQkFBQTtBQUNGOztBQUVBO0VBQ0UsWUFBQTtFQUNBLGNBQUE7QUFDRjs7QUFFQTtFQUNFLFlBQUE7QUFDRiIsImZpbGUiOiJhZGQtcG9zdC5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIm1hdC1mb3JtLWZpZWxkLFxyXG50ZXh0YXJlYSB7XHJcbiAgd2lkdGg6IDEwMCU7XHJcbn1cclxuXHJcbm1hdC1zcGlubmVyIHtcclxuICBtYXJnaW46IGF1dG87XHJcbn1cclxuXHJcbi5oaWRkZW4ge1xyXG4gIHZpc2liaWxpdHk6IGhpZGRlbjtcclxufVxyXG5cclxuLmltYWdlLXByZXZpZXcge1xyXG4gIGhlaWdodDogNXJlbTtcclxuICBtYXJnaW46IDFyZW0gMDtcclxufVxyXG5cclxuLmltYWdlLXByZXZpZXcgaW1nIHtcclxuICBoZWlnaHQ6IDEwMCU7XHJcbn1cclxuIl19 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AddPostComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-add-post',
                templateUrl: './add-post.component.html',
                styleUrls: ['./add-post.component.scss']
            }]
    }], function () { return [{ type: src_app_services_add_post_service__WEBPACK_IMPORTED_MODULE_5__["AddPostService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_6__["ActivatedRoute"] }]; }, { CitySearchComponent: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"],
            args: [_city_search_city_search_component__WEBPACK_IMPORTED_MODULE_4__["CitySearchComponent"]]
        }] }); })();


/***/ }),

/***/ "tuAr":
/*!*****************************************************************!*\
  !*** ./src/app/components/city-search/city-search.component.ts ***!
  \*****************************************************************/
/*! exports provided: CitySearchComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CitySearchComponent", function() { return CitySearchComponent; });
/* harmony import */ var _models_geocodeResp_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../../models/geocodeResp.model */ "ApTs");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "s7LF");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/select */ "ZTz/");
/* harmony import */ var _services_map_openstreetmap_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./../../services/map/openstreetmap.service */ "9W9C");
/* harmony import */ var _services_map_map_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./../../services/map/map.service */ "HYNq");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/form-field */ "Q2Ze");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/tooltip */ "ZFy/");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/input */ "e6WT");
/* harmony import */ var _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/autocomplete */ "vrAh");
/* harmony import */ var _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @rxweb/reactive-form-validators */ "OoVr");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/icon */ "Tj54");
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/progress-spinner */ "pu8Q");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/core */ "UhP/");




















function CitySearchComponent_button_5_Template(rf, ctx) { if (rf & 1) {
    const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "button", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function CitySearchComponent_button_5_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r7); const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); ctx_r6.myControl.patchValue(""); return ctx_r6._clickedOptionLocal = null; });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2, "close");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function CitySearchComponent_small_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "small", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "this is not a valid region");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function CitySearchComponent_mat_spinner_9_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](0, "mat-spinner", 11);
} }
function CitySearchComponent_mat_option_10_Template(rf, ctx) { if (rf & 1) {
    const _r10 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "mat-option", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("onSelectionChange", function CitySearchComponent_mat_option_10_Template_mat_option_onSelectionChange_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r10); const country_r8 = ctx.$implicit; const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r9.onOptionClick(country_r8); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const country_r8 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("value", country_r8.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](country_r8.name);
} }
class CitySearchComponent {
    constructor(OpenstreetmapService, MapService, ActivatedRoute) {
        this.OpenstreetmapService = OpenstreetmapService;
        this.MapService = MapService;
        this.ActivatedRoute = ActivatedRoute;
        // for custom event emiting
        this.locationAdded = new _angular_core__WEBPACK_IMPORTED_MODULE_3__["EventEmitter"]();
        // search input variables
        this.myControl = new _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControl"](null);
        this.isLoading = false;
        // display suggestions on autosuggest
        this._autoSuggested = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"]([]);
        this.autoSuggested = this._autoSuggested.asObservable();
        // return clicked option
        this._clickedOptionLocal = null;
        this._clickedOption = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"](this._clickedOptionLocal);
        this.clickedOption = this._clickedOption.asObservable();
    }
    ngOnInit() {
        this.MapService.citySearchPresent = true;
        this.ActivatedRoute.queryParams.subscribe((params) => {
            if (params.lng) {
                this.OpenstreetmapService.reverseSearch(params.lng, params.lat)
                    .subscribe((res) => {
                    if (res.features[0]) {
                        this.myControl.patchValue(this.removeMiddle(res.features[0].properties.display_name, 0));
                        this._clickedOptionLocal = new _models_geocodeResp_model__WEBPACK_IMPORTED_MODULE_0__["geocodeResponseModel"](this.myControl.value, res.features[0].geometry.coordinates);
                        this._clickedOption.next(this._clickedOptionLocal);
                    }
                });
            }
        });
        // search for new cities on input value change
        this.searched = this.myControl.valueChanges.subscribe(x => {
            this._clickedOptionLocal = null;
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.isLoading = true;
                this._autoSuggested.next([{}]);
                this.openstreetmap_sub = this.OpenstreetmapService.citySearch(x.toString()).subscribe(response => {
                    this.isLoading = false;
                    const searchResults = [];
                    response.features.forEach(element => {
                        const name = this.removeMiddle(element.properties.display_name, 1);
                        searchResults.push({ name, content: element });
                    });
                    this._autoSuggested.next(searchResults);
                }, (err) => {
                    this.isLoading = false;
                    console.log(err);
                });
            }, 400);
        });
        if (this.getFakeCenterCity) {
            // sub to city name at fake center
            this.fakeCenterCity_sub = this.MapService.fakeCenterCity.subscribe((res) => {
                if (res.features) {
                    this.placeholder = 'Region';
                    this.myControl.patchValue(this.removeMiddle(res.features[0].properties.display_name, 1));
                    this._clickedOptionLocal = new _models_geocodeResp_model__WEBPACK_IMPORTED_MODULE_0__["geocodeResponseModel"](this.myControl.value, res.features[0].geometry.coordinates);
                    this._clickedOption.next(this._clickedOptionLocal);
                }
                else {
                    this.myControl.patchValue('');
                    this.placeholder = 'No city found';
                }
            });
        }
    }
    ngAfterViewInit() {
    }
    /** check if input contains valid city */
    checkCityValidity() {
        if (!this._clickedOptionLocal || this.myControl.value == '') {
            return true;
        }
        else {
            return false;
        }
    }
    /** filters city name string, always keep first and last string */
    removeMiddle(string, keep) {
        const arr = string.split(',');
        let nothing = arr.shift();
        for (let x = 0; x < keep; x++) {
            if (arr[x] != arr.slice(-1)[0]) {
                nothing = nothing.concat(', ', arr[x]);
            }
        }
        return nothing.concat(', ', arr[arr.length - 1]);
    }
    /** when option is clicked */
    onOptionClick(country) {
        this._clickedOptionLocal = new _models_geocodeResp_model__WEBPACK_IMPORTED_MODULE_0__["geocodeResponseModel"](country.name, country.content.geometry.coordinates, country.content);
        this._clickedOption.next(this._clickedOptionLocal);
        this.clearOnSearch ? this.myControl.patchValue('') : null;
        // this.emitCountry(this._clickedOptionLocal.name)
    }
    emitCountry(city) {
        console.log(city);
        this.locationAdded.emit(city);
        this.clearOnSearch ? this.myControl.patchValue('') : null;
    }
    ngOnDestroy() {
        this.MapService.citySearchPresent = false;
        this.searched.unsubscribe();
        this.fakeCenterCity_sub ? this.fakeCenterCity_sub.unsubscribe() : null;
        this.openstreetmap_sub ? this.openstreetmap_sub.unsubscribe() : null;
    }
}
CitySearchComponent.ɵfac = function CitySearchComponent_Factory(t) { return new (t || CitySearchComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_map_openstreetmap_service__WEBPACK_IMPORTED_MODULE_5__["OpenstreetmapService"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_map_map_service__WEBPACK_IMPORTED_MODULE_6__["MapService"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__["ActivatedRoute"])); };
CitySearchComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({ type: CitySearchComponent, selectors: [["app-city-search"]], viewQuery: function CitySearchComponent_Query(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵviewQuery"](_angular_material_select__WEBPACK_IMPORTED_MODULE_4__["MatSelect"], true);
    } if (rf & 2) {
        var _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵloadQuery"]()) && (ctx.MatSelect = _t.first);
    } }, inputs: { appearance: "appearance", placeholder: "placeholder", location: "location", getFakeCenterCity: "getFakeCenterCity", clearOnSearch: "clearOnSearch" }, outputs: { locationAdded: "locationAdded" }, decls: 12, vars: 11, consts: [["matTooltipShowDelay", "800", 1, "example-full-width", 2, "width", "100%", 3, "appearance", "matTooltip"], ["type", "text", "matInput", "", "placeholder", "Ex. Berlin", "autocomplete", "off", 3, "matAutocomplete", "formControl"], ["searchInput", "matInput"], ["mat-button", "", "matSuffix", "", "mat-icon-button", "", "aria-label", "Clear", "type", "button", 3, "click", 4, "ngIf"], ["class", "text-danger", 4, "ngIf"], ["panelWidth", "25%"], ["auto", "matAutocomplete"], ["style", "margin:0 auto;", 4, "ngIf"], [3, "value", "onSelectionChange", 4, "ngFor", "ngForOf"], ["mat-button", "", "matSuffix", "", "mat-icon-button", "", "aria-label", "Clear", "type", "button", 3, "click"], [1, "text-danger"], [2, "margin", "0 auto"], [3, "value", "onSelectionChange"]], template: function CitySearchComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "mat-form-field", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](3, "input", 1, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](5, CitySearchComponent_button_5_Template, 3, 0, "button", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](6, CitySearchComponent_small_6_Template, 2, 0, "small", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](7, "mat-autocomplete", 5, 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](9, CitySearchComponent_mat_spinner_9_Template, 1, 0, "mat-spinner", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](10, CitySearchComponent_mat_option_10_Template, 3, 2, "mat-option", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](11, "async");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    } if (rf & 2) {
        const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵreference"](4);
        const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵreference"](8);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpropertyInterpolate"]("matTooltip", _r0.value);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("appearance", ctx.appearance);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx.placeholder);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("matAutocomplete", _r3)("formControl", ctx.myControl);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.myControl.value);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", !ctx.checkCityValidity() && ctx.myControl.touched);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.isLoading);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](11, 9, ctx.autoSuggested));
    } }, directives: [_angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__["MatFormField"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_9__["MatTooltip"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_10__["MatInput"], _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_11__["MatAutocompleteTrigger"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormControlDirective"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_12__["ɵk"], _rxweb_reactive_form_validators__WEBPACK_IMPORTED_MODULE_12__["ɵe"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["NgIf"], _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_11__["MatAutocomplete"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["NgForOf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_14__["MatButton"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__["MatSuffix"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_15__["MatIcon"], _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_16__["MatSpinner"], _angular_material_core__WEBPACK_IMPORTED_MODULE_17__["MatOption"]], pipes: [_angular_common__WEBPACK_IMPORTED_MODULE_13__["AsyncPipe"]], styles: ["button[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxjaXR5LXNlYXJjaC5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLGFBQUE7QUFDSiIsImZpbGUiOiJjaXR5LXNlYXJjaC5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbImJ1dHRvbjpmb2N1c3tcclxuICAgIG91dGxpbmU6IG5vbmU7XHJcbn0iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵsetClassMetadata"](CitySearchComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_3__["Component"],
        args: [{
                selector: 'app-city-search',
                templateUrl: './city-search.component.html',
                styleUrls: ['./city-search.component.scss']
            }]
    }], function () { return [{ type: _services_map_openstreetmap_service__WEBPACK_IMPORTED_MODULE_5__["OpenstreetmapService"] }, { type: _services_map_map_service__WEBPACK_IMPORTED_MODULE_6__["MapService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_7__["ActivatedRoute"] }]; }, { MatSelect: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_3__["ViewChild"],
            args: [_angular_material_select__WEBPACK_IMPORTED_MODULE_4__["MatSelect"]]
        }], appearance: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_3__["Input"]
        }], placeholder: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_3__["Input"]
        }], location: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_3__["Input"]
        }], getFakeCenterCity: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_3__["Input"]
        }], clearOnSearch: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_3__["Input"]
        }], locationAdded: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_3__["Output"]
        }] }); })();


/***/ }),

/***/ "vY5A":
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var _components_registration_process_registration_process_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/registration-process/registration-process.component */ "OlRB");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _components_loginpage_loginpage_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/loginpage/loginpage.component */ "O3zK");
/* harmony import */ var _components_profile_profile_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/profile/profile.component */ "DZ0t");
/* harmony import */ var _components_tabs_mytrip_mytrip_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/tabs/mytrip/mytrip.component */ "/mFC");
/* harmony import */ var _components_myaccount_myaccount_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/myaccount/myaccount.component */ "AKBL");
/* harmony import */ var _components_tabs_searchresults_searchresults_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/tabs/searchresults/searchresults.component */ "a1cW");
/* harmony import */ var _components_venue_venue_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/venue/venue.component */ "Bg0t");
/* harmony import */ var _components_search_bar_search_bar_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/search-bar/search-bar.component */ "lCy9");
/* harmony import */ var _components_userprofile_userprofile_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./components/userprofile/userprofile.component */ "P1Wc");
/* harmony import */ var _components_add_post_add_post_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./components/add-post/add-post.component */ "qF1r");














const routes = [
    { path: 'create', component: _components_add_post_add_post_component__WEBPACK_IMPORTED_MODULE_11__["AddPostComponent"] },
    { path: 'edit/:postId', component: _components_add_post_add_post_component__WEBPACK_IMPORTED_MODULE_11__["AddPostComponent"] },
    { path: 'login', component: _components_loginpage_loginpage_component__WEBPACK_IMPORTED_MODULE_3__["LoginComponent"] },
    { path: 'register', component: _components_registration_process_registration_process_component__WEBPACK_IMPORTED_MODULE_1__["RegistrationProcessComponent"] },
    { path: 'profile', component: _components_profile_profile_component__WEBPACK_IMPORTED_MODULE_4__["ProfileComponent"] },
    // { path: 'home', component: HomeComponent },
    // { path: 'home/:query', component: HomeComponent },
    { path: 'mytrip', component: _components_tabs_mytrip_mytrip_component__WEBPACK_IMPORTED_MODULE_5__["MytripComponent"], children: [
            { path: '**', component: _components_tabs_mytrip_mytrip_component__WEBPACK_IMPORTED_MODULE_5__["MytripComponent"] }
        ] },
    { path: 'myaccount', component: _components_myaccount_myaccount_component__WEBPACK_IMPORTED_MODULE_6__["MyaccountComponent"] },
    { path: 'search', component: _components_search_bar_search_bar_component__WEBPACK_IMPORTED_MODULE_9__["SearchBarComponent"], children: [
            { path: 'venue/:query', component: _components_venue_venue_component__WEBPACK_IMPORTED_MODULE_8__["VenueComponent"] },
            { path: 'user/:query', component: _components_userprofile_userprofile_component__WEBPACK_IMPORTED_MODULE_10__["UserprofileComponent"] },
            { path: '**', component: _components_tabs_searchresults_searchresults_component__WEBPACK_IMPORTED_MODULE_7__["SearchresultsComponent"] },
        ] },
    { path: '', redirectTo: 'mytrip', pathMatch: 'full' }
];
class AppRoutingModule {
}
AppRoutingModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineNgModule"]({ type: AppRoutingModule });
AppRoutingModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjector"]({ factory: function AppRoutingModule_Factory(t) { return new (t || AppRoutingModule)(); }, imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"].forRoot(routes)], _angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵsetNgModuleScope"](AppRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵsetClassMetadata"](AppRoutingModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_2__["NgModule"],
        args: [{
                imports: [_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"].forRoot(routes)],
                exports: [_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "woXb":
/*!**********************************************!*\
  !*** ./src/app/services/add-post.service.ts ***!
  \**********************************************/
/*! exports provided: AddPostService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AddPostService", function() { return AddPostService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var src_environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/environments/environment */ "AytR");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common/http */ "IheW");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ "iInd");







class AddPostService {
    constructor(http, router) {
        this.http = http;
        this.router = router;
        this.url = src_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].travelnetURL + "/api/posts/";
        this.posts = [];
        this.postsUpdated = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
    }
    getPosts() {
        this.http
            .get(this.url)
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["map"])(postData => {
            let formattedComment;
            let formattedReply;
            return postData.posts.map(post => {
                return {
                    _id: post._id,
                    date: post.date,
                    location: post.location,
                    likes: post.likes,
                    author: post.author,
                    title: post.title,
                    content: post.content,
                    imagePath: post.imagePath,
                    tags: post.tags,
                    comments: post.comments
                };
            });
        }))
            .subscribe(transformedPosts => {
            this.posts = transformedPosts;
            this.postsUpdated.next(this.posts);
        });
    }
    getRelevantPosts(UserPref) {
        this.http
            .post(this.url + 'getSpecific/', UserPref).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["map"])(postData => {
            return postData.posts.map(post => {
                return {
                    _id: post._id,
                    date: post.date,
                    location: post.location,
                    likes: post.likes,
                    author: post.author,
                    title: post.title,
                    content: post.content,
                    imagePath: post.imagePath,
                    tags: post.tags,
                    comments: post.comments
                };
            });
        })).subscribe(transformedPosts => {
            this.posts = transformedPosts;
            this.postsUpdated.next(this.posts);
        });
    }
    searchPosts(input) {
        this.http
            .post(this.url + 'getOne', input).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["map"])(postData => {
            return postData.posts.map(post => {
                return {
                    _id: post._id,
                    date: post.date,
                    location: post.location,
                    likes: post.likes,
                    author: post.author,
                    title: post.title,
                    content: post.content,
                    imagePath: post.imagePath,
                    tags: post.tags,
                    comments: post.comments
                };
            });
        })).subscribe(transformedPosts => {
            this.posts = transformedPosts;
            console.log(this.posts);
            this.postsUpdated.next(this.posts);
        });
    }
    getPostUpdateListener() {
        return this.postsUpdated.asObservable();
    }
    getPost(id) {
        return this.http.get(this.url + id);
    }
    /**is now implemented inside user */
    addPost(newPost) {
        const postData = new FormData();
        postData.append('date', newPost.date);
        postData.append('location', newPost.location);
        postData.append('author', newPost.author);
        postData.append('title', newPost.title);
        postData.append('content', newPost.content);
        postData.append('image', newPost.image, newPost.title);
        postData.append('tags', newPost.tags);
        this.http
            .post(this.url, postData, {
            headers: {
                authorization: localStorage.getItem('token') ? localStorage.getItem('token').toString() : 'monkas'
            }
        })
            .subscribe(responseData => {
            const post = {
                _id: responseData.post._id,
                date: responseData.post.date,
                location: responseData.post.location,
                author: responseData.post.author,
                likes: responseData.post.likes,
                title: newPost.Title,
                content: newPost.content,
                imagePath: responseData.post.imagePath,
                tags: responseData.post.tags,
                comments: responseData.post.comments,
            };
            this.posts.push(post);
            this.postsUpdated.next(this.posts);
            this.router.navigate(['/']);
            console.log(this.posts);
        });
    }
    updatePost(newPost) {
        // id: string, title: string, content: string, image: File | string
        let postData;
        if (typeof newPost.image === 'object') {
            postData = new FormData();
            postData.append('id', newPost._id);
            postData.append('date', newPost.date);
            postData.append('location', newPost.location);
            postData.append('author', newPost.author);
            postData.append('likes', newPost.likes);
            postData.append('title', newPost.title);
            postData.append('content', newPost.content);
            postData.append('image', newPost.image, newPost.title);
            postData.append('tags', newPost.tags);
            postData.append('comments', newPost.comments);
        }
        else {
            postData = {
                _id: newPost._id,
                date: newPost.date,
                location: newPost.location,
                author: newPost.author,
                likes: newPost.likes,
                title: newPost.title,
                content: newPost.content,
                imagePath: newPost.image,
                tags: newPost.tags,
                comments: newPost.comments
            };
        }
        this.http
            .put(this.url + newPost._id, postData)
            .subscribe(response => {
            const updatedPosts = [...this.posts];
            const oldPostIndex = updatedPosts.findIndex(p => p._id === newPost.id);
            const post = {
                _id: newPost._id,
                date: newPost.date,
                location: newPost.location,
                author: newPost.author,
                likes: newPost.likes,
                title: newPost.title,
                content: newPost.content,
                imagePath: '',
                tags: newPost.tags,
                comments: newPost.comments
            };
            console.log(post);
            updatedPosts[oldPostIndex] = post;
            this.posts = updatedPosts;
            this.postsUpdated.next(this.posts);
            this.router.navigate(['/']);
        });
    }
    deletePost(postId) {
        this.http
            .delete(this.url + postId)
            .subscribe(() => {
            const updatedPosts = this.posts.filter(post => post._id !== postId);
            this.posts = updatedPosts;
            this.postsUpdated.next(this.posts);
        });
    }
    likePost(postId, username) {
        const updatedPostIndex = this.posts.indexOf(this.posts.find(post => post._id == postId));
        this.http
            .put(this.url + 'like/' + postId, { username })
            .subscribe((response) => {
            (this.posts[updatedPostIndex]).likes = response.likes;
            this.postsUpdated.next(this.posts);
        });
    }
    updatePosts(posts) {
        this.postsUpdated.next(posts);
    }
}
AddPostService.ɵfac = function AddPostService_Factory(t) { return new (t || AddPostService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_4__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"])); };
AddPostService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: AddPostService, factory: AddPostService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AddPostService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_4__["HttpClient"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"] }]; }, null); })();


/***/ }),

/***/ "zBoC":
/*!*********************************************************!*\
  !*** ./src/app/components/sidebar/sidebar.component.ts ***!
  \*********************************************************/
/*! exports provided: SidebarComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SidebarComponent", function() { return SidebarComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var src_app_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/app/services/chatsystem/friendlist.service */ "+7u6");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "iInd");
/* harmony import */ var src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/services/map/map.service */ "HYNq");
/* harmony import */ var src_app_services_session_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/services/session.service */ "IfdK");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ "SVse");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/sidenav */ "q7Ft");
/* harmony import */ var angular_resizable_element__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! angular-resizable-element */ "yotz");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/button */ "Dxy4");










const _c0 = ["drawer"];
function SidebarComponent_div_0_Template(rf, ctx) { if (rf & 1) {
    const _r8 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "button", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function SidebarComponent_div_0_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r8); const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵreference"](3); _r1.toggle(); return ctx_r7.window = !ctx_r7.window; });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, " Open Sidebar ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function SidebarComponent_button_9_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "My Trip");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function SidebarComponent_button_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "My Trip");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function SidebarComponent_button_11_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "Search");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function SidebarComponent_button_12_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "Search");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
const _c1 = function () { return { bottom: false, right: true, top: false, left: false }; };
class SidebarComponent {
    constructor(FriendlistService, Router, MapService, SessionService) {
        this.FriendlistService = FriendlistService;
        this.Router = Router;
        this.MapService = MapService;
        this.SessionService = SessionService;
        this.window = true;
        this.width = 0.4;
        this.Styles = {
            position: 'fixed',
            'background-color': 'rgba(255,255,255,0.75)',
            'min-width': '710px',
            top: '1%',
            left: '1%',
            height: '95%',
            'max-height': '95%',
            overflow: 'hidden',
            padding: '0',
            width: `${window.innerWidth >= 500 ? window.innerWidth * this.width : window.innerWidth}px`,
        };
        this.showFiller = true;
        this.tabs = ['home', 'mytrip', 'search'];
    }
    selectedTab() {
        if (this.Router.url.substr(0, 7) == '/search') {
            return '/search';
        }
        else {
            return this.Router.url;
        }
    }
    ngOnInit() {
    }
    ngAfterViewInit() {
        this.windowSub = this.FriendlistService.windowSize.subscribe((windowWidth) => {
            if (windowWidth <= this.drawer._width) {
                if (windowWidth < 500 || window.innerWidth) {
                    this.window = false;
                }
                else {
                    this.Styles.width = `${windowWidth * 0.96}px`;
                }
            }
            else {
                this.window = true;
            }
        });
    }
    validate(event) {
        const MIN_DIMENSIONS_PX = 500;
        const maxWidth = window.innerWidth * 0.96;
        if (event.rectangle.width && // if defined
            event.rectangle.height && // if defined
            (event.rectangle.width < MIN_DIMENSIONS_PX ||
                event.rectangle.width > maxWidth)) {
            return false;
        }
        else {
            return true;
        }
    }
    onResizeEnd(event) {
        this.Styles.width = `${event.rectangle.width}px`;
        this.SessionService.updateSidebarWidth(event.rectangle.width);
        this.MapService.getFakeCenter();
    }
    ngOnDestroy() {
        this.windowSub.unsubscribe();
        this.openTabSub.unsubscribe();
    }
}
SidebarComponent.ɵfac = function SidebarComponent_Factory(t) { return new (t || SidebarComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__["FriendlistService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_3__["MapService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](src_app_services_session_service__WEBPACK_IMPORTED_MODULE_4__["SessionService"])); };
SidebarComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: SidebarComponent, selectors: [["app-sidebar"]], viewQuery: function SidebarComponent_Query(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵviewQuery"](_c0, true);
    } if (rf & 2) {
        var _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵloadQuery"]()) && (ctx.drawer = _t.first);
    } }, decls: 21, vars: 11, consts: [["class", "example-sidenav-content bg-light", "id", "openToggle", 4, "ngIf"], ["autosize", "", 1, "container-fluid", "border"], ["mwlResizable", "", "mode", "side", 3, "validateResize", "enableGhostResize", "opened", "ngStyle", "resizeEnd"], ["drawer", ""], ["mwlResizeHandle", "", "id", "resize", 1, "btn", "border-left", 3, "resizeEdges"], ["width", "1em", "height", "1em", "viewBox", "0 0 16 16", "fill", "currentColor", "xmlns", "http://www.w3.org/2000/svg", 1, "bi", "bi-grip-horizontal"], ["d", "M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"], [1, "container", "row", "border-bottom", 2, "background-color", "rgba(255, 255, 255, 1)", "padding-right", "1%", "margin", "0", "margin-right", "1%", "min-width", "100%"], ["mat-button", "", "class", "nav-link col", "routerLink", "mytrip", 4, "ngIf"], ["mat-raised-button", "", "class", "nav-link col", "routerLink", "mytrip", 4, "ngIf"], ["mat-button", "", "class", "nav-link col", "routerLink", "search", 4, "ngIf"], ["mat-raised-button", "", "class", "nav-link col", "routerLink", "search", 4, "ngIf"], ["mat-button", "", "color", "warn", "id", "closeToggle", "type", "button", 1, "close-nav", "nav-link", 3, "click"], ["width", "1em", "height", "1em", "viewBox", "0 0 16 16", "fill", "currentColor", "xmlns", "http://www.w3.org/2000/svg", 1, "bi", "bi-arrow-bar-left"], ["fill-rule", "evenodd", "d", "M5.854 4.646a.5.5 0 0 0-.708 0l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708-.708L3.207 8l2.647-2.646a.5.5 0 0 0 0-.708z"], ["fill-rule", "evenodd", "d", "M10 8a.5.5 0 0 0-.5-.5H3a.5.5 0 0 0 0 1h6.5A.5.5 0 0 0 10 8zm2.5 6a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 1 0v11a.5.5 0 0 1-.5.5z"], [1, "container-fluid", 2, "width", "98%", "max-height", "95%", "padding", "0", "padding-top", "1%", "padding-top", "0", "margin-left", "0", "margin-right", "0", "overflow-y", "auto"], ["oi", ""], [2, "height", "100%"], ["id", "openToggle", 1, "example-sidenav-content", "bg-light"], ["type", "button", "mat-button", "", 3, "click"], ["mat-button", "", "routerLink", "mytrip", 1, "nav-link", "col"], ["mat-raised-button", "", "routerLink", "mytrip", 1, "nav-link", "col"], ["mat-button", "", "routerLink", "search", 1, "nav-link", "col"], ["mat-raised-button", "", "routerLink", "search", 1, "nav-link", "col"]], template: function SidebarComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](0, SidebarComponent_div_0_Template, 3, 0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-drawer-container", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "mat-drawer", 2, 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("resizeEnd", function SidebarComponent_Template_mat_drawer_resizeEnd_2_listener($event) { return ctx.onResizeEnd($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "button", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnamespaceSVG"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "svg", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](7, "path", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnamespaceHTML"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](9, SidebarComponent_button_9_Template, 2, 0, "button", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](10, SidebarComponent_button_10_Template, 2, 0, "button", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](11, SidebarComponent_button_11_Template, 2, 0, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](12, SidebarComponent_button_12_Template, 2, 0, "button", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](13, "button", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function SidebarComponent_Template_button_click_13_listener() { return ctx.window = !ctx.window; });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](14, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnamespaceSVG"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](15, "svg", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](16, "path", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](17, "path", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnamespaceHTML"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](18, "div", 16, 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](20, "router-outlet", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", !ctx.window);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("validateResize", ctx.validate)("enableGhostResize", true)("opened", ctx.window)("ngStyle", ctx.Styles);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("resizeEdges", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](10, _c1));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.selectedTab() != "/mytrip");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.selectedTab() == "/mytrip");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.selectedTab() != "/search");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.selectedTab() == "/search");
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_5__["NgIf"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_6__["MatDrawerContainer"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_6__["MatDrawer"], angular_resizable_element__WEBPACK_IMPORTED_MODULE_7__["ResizableDirective"], _angular_common__WEBPACK_IMPORTED_MODULE_5__["NgStyle"], angular_resizable_element__WEBPACK_IMPORTED_MODULE_7__["ResizeHandleDirective"], _angular_material_button__WEBPACK_IMPORTED_MODULE_8__["MatButton"], _angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterOutlet"], _angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterLink"]], styles: ["#openToggle[_ngcontent-%COMP%] {\n  z-index: 2;\n  position: fixed;\n  top: 3%;\n  left: 2%;\n}\n\n#resize[_ngcontent-%COMP%] {\n  z-index: 2;\n  position: absolute;\n  right: 0px;\n  top: 0;\n  bottom: 0;\n  padding: 0;\n  margin: 0;\n  width: 2%;\n  min-width: 15px;\n  background-color: rgba(255, 255, 255, 0.9);\n  cursor: col-resize;\n}\n\nmwlResizable[_ngcontent-%COMP%] {\n  box-sizing: border-box;\n}\n\n.btn[_ngcontent-%COMP%] {\n  cursor: pointer;\n}\n\nbutton[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcLi5cXC4uXFxzaWRlYmFyLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsVUFBQTtFQUNBLGVBQUE7RUFDQSxPQUFBO0VBQ0EsUUFBQTtBQUNGOztBQUVBO0VBQ0UsVUFBQTtFQUNBLGtCQUFBO0VBQ0EsVUFBQTtFQUNBLE1BQUE7RUFDQSxTQUFBO0VBQ0EsVUFBQTtFQUNBLFNBQUE7RUFDQSxTQUFBO0VBQ0EsZUFBQTtFQUVBLDBDQUFBO0VBQ0Esa0JBQUE7QUFBRjs7QUFHQTtFQUNFLHNCQUFBO0FBQUY7O0FBR0E7RUFDRSxlQUFBO0FBQUY7O0FBR0E7RUFDRSxhQUFBO0FBQUYiLCJmaWxlIjoic2lkZWJhci5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIiNvcGVuVG9nZ2xlIHtcclxuICB6LWluZGV4OiAyO1xyXG4gIHBvc2l0aW9uOiBmaXhlZDtcclxuICB0b3A6IDMlO1xyXG4gIGxlZnQ6IDIlO1xyXG59XHJcblxyXG4jcmVzaXplIHtcclxuICB6LWluZGV4OiAyO1xyXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICByaWdodDogMHB4O1xyXG4gIHRvcDogMDtcclxuICBib3R0b206IDA7XHJcbiAgcGFkZGluZzogMDtcclxuICBtYXJnaW46IDA7XHJcbiAgd2lkdGg6IDIlO1xyXG4gIG1pbi13aWR0aDogMTVweDtcclxuICAvLyBtYXgtd2lkdGg6IDI1cHg7XHJcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjkpO1xyXG4gIGN1cnNvcjogY29sLXJlc2l6ZTtcclxufVxyXG5cclxubXdsUmVzaXphYmxlIHtcclxuICBib3gtc2l6aW5nOiBib3JkZXItYm94OyAvLyByZXF1aXJlZCBmb3IgdGhlIGVuYWJsZUdob3N0UmVzaXplIG9wdGlvbiB0byB3b3JrXHJcbn1cclxuXHJcbi5idG4ge1xyXG4gIGN1cnNvcjogcG9pbnRlcjtcclxufVxyXG5cclxuYnV0dG9uOmZvY3VzIHtcclxuICBvdXRsaW5lOiBub25lO1xyXG59XHJcblxyXG4iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](SidebarComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-sidebar',
                templateUrl: './sidebar.component.html',
                styleUrls: ['./sidebar.component.scss'],
            }]
    }], function () { return [{ type: src_app_services_chatsystem_friendlist_service__WEBPACK_IMPORTED_MODULE_1__["FriendlistService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] }, { type: src_app_services_map_map_service__WEBPACK_IMPORTED_MODULE_3__["MapService"] }, { type: src_app_services_session_service__WEBPACK_IMPORTED_MODULE_4__["SessionService"] }]; }, { drawer: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"],
            args: ['drawer']
        }] }); })();


/***/ }),

/***/ "zUnb":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "8Y7J");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./environments/environment */ "AytR");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "ZAI4");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/platform-browser */ "cUpR");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
_angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__["platformBrowser"]().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(err => console.error(err));


/***/ }),

/***/ "zn8P":
/*!******************************************************!*\
  !*** ./$$_lazy_route_resource lazy namespace object ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "zn8P";

/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main-es2015.js.map