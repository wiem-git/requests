sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"./utilities",
		"sap/ui/core/routing/History",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/Sorter"

	], function (BaseController, MessageBox, Utilities, History, JSONModel, FilterOperator, Filter, Sorter) {
		"use strict";
		return BaseController.extend("com.sap.build.standard.approveLeaveRequests.controller.RequestsMaster", {
			handleRouteMatched: function (oEvent) {
				var sAppId = "App5df3a595b8adc8728c2ed95f";
				var oParams = {};
				var oView = this.getView();
				var bSelectFirstListItem = true;
				if (oEvent.mParameters.data.context || oEvent.mParameters.data.masterContext) {
					this.sContext = oEvent.mParameters.data.context;
					this.sMasterContext = oEvent.mParameters.data.masterContext;
				} else {
					if (this.getOwnerComponent().getComponentData()) {
						var patternConvert = function (oParam) {
							if (Object.keys(oParam).length !== 0) {
								for (var prop in oParam) {
									if (prop !== "sourcePrototype" && prop.includes("Set")) {
										return prop + "(" + oParam[prop][0] + ")";
									}
								}
							}
						};
						this.sMasterContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);
					}
				}
				var oPath;
				if (this.sMasterContext && oEvent.getParameters().config.bypassed.target[0] !== this.sMasterContext) {
					oPath = {
						path: "/" + this.sMasterContext,
						parameters: oParams
					};
					this.getView().bindObject(oPath);
				} else if (this.sContext) {
					var sCurrentContextPath = "/" + this.sContext;
					bSelectFirstListItem = false;
				}
				if (bSelectFirstListItem) {
					oView.addEventDelegate({
						onBeforeShow: function () {
							var oContent = this.getView().getContent();
							if (oContent) {
								if (!sap.ui.Device.system.phone) {
									var oList = oContent[0].getContent() ? oContent[0].getContent()[0] : undefined;
									if (oList) {
										var sContentName = oList.getMetadata().getName();
										if (sContentName.indexOf("List") > -1) {
											oList.attachEventOnce("updateFinished", function () {
												var oFirstListItem = this.getItems()[0];
												if (oFirstListItem) {
													oList.setSelectedItem(oFirstListItem);
													oList.fireItemPress({
														listItem: oFirstListItem
													});
												}
											}.bind(oList));
										}
									}
								}
							}
						}.bind(this)
					});
				}
			},

			_attachSelectListItemWithContextPath: function (sContextPath) {
				var oView = this.getView();
				var oContent = this.getView().getContent();
				if (oContent) {
					if (!sap.ui.Device.system.phone) {
						var oList = oContent[0].getContent() ? oContent[0].getContent()[0] : undefined;
						if (oList && sContextPath) {
							var sContentName = oList.getMetadata().getName();
							var oItemToSelect, oItem, oContext, aItems, i;
							if (sContentName.indexOf("List") > -1) {
								if (oList.getItems().length) {
									oItemToSelect = null;
									aItems = oList.getItems();
									for (i = 0; i < aItems.length; i++) {
										oItem = aItems[i];
										oContext = oItem.getBindingContext();
										if (oContext && oContext.getPath() === sContextPath) {
											oItemToSelect = oItem;
										}
									}
									if (oItemToSelect) {
										oList.setSelectedItem(oItemToSelect);
									}
								} else {
									oView.addEventDelegate({
										onBeforeShow: function () {
											oList.attachEventOnce("updateFinished", function () {
												oItemToSelect = null;
												aItems = oList.getItems();
												for (i = 0; i < aItems.length; i++) {
													oItem = aItems[i];
													oContext = oItem.getBindingContext();
													if (oContext && oContext.getPath() === sContextPath) {
														oItemToSelect = oItem;
													}
												}
												if (oItemToSelect) {
													oList.setSelectedItem(oItemToSelect);
												}
											});
										}
									});
								}
							}
						}
					}
				}
			},
			//Tell the router to nav to request Detail
			_onObjectListItemPress: function (oEvent) {
				var oBindingContext = oEvent.getParameter("listItem").getBindingContext();

				return new Promise(function (fnResolve) {
					this.doNavigate("RequestDetail", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			},
			doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
				var sPath = oBindingContext ? oBindingContext.getPath() : null;

				var oModel = oBindingContext ? oBindingContext.getModel() : null;
				var sEntityNameSet;
				if (sPath !== null && sPath !== "") {
					if (sPath.substring(0, 1) === "/") {
						sPath = sPath.substring(1);
					}
					sEntityNameSet = sPath.split("(")[0];
				}
				var sNavigationPropertyName;
				var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;
				if (sEntityNameSet !== null) {
					sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
						sRouteName);
				}
				if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
					if (sNavigationPropertyName === "") {
						this.oRouter.navTo(sRouteName, {
							context: sPath,
							masterContext: sMasterContext
						}, false);
					} else {
						oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
							if (bindingContext) {
								sPath = bindingContext.getPath();
								if (sPath.substring(0, 1) === "/") {
									sPath = sPath.substring(1);
								}
							} else {
								sPath = "undefined";
							}
							// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
							if (sPath === "undefined") {
								this.oRouter.navTo(sRouteName);
							} else {
								this.oRouter.navTo(sRouteName, {
									context: sPath,
									masterContext: sMasterContext
								}, false);
							}
						}.bind(this));
					}
				} else {
					this.oRouter.navTo(sRouteName);
				}
				if (typeof fnPromiseResolve === "function") {
					fnPromiseResolve();
				}
			},
			onInit: function () {

				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("RequestsMaster").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
	   this.RequestCount();

			},

			// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
			onExit: function () {
				var aControls = [{
					"controlId": "sap_List_Page_0-content-sap_m_ObjectList-1527615328690",
					"groups": ["items"]
				}];
				for (var i = 0; i < aControls.length; i++) {
					var oControl = this.getView().byId(aControls[i].controlId);
					if (oControl) {
						for (var j = 0; j < aControls[i].groups.length; j++) {
							var sAggregationName = aControls[i].groups[j];
							var oBindingInfo = oControl.getBindingInfo(sAggregationName);
							if (oBindingInfo) {
								var oTemplate = oBindingInfo.template;
								oTemplate.destroy();
							}
						}
					}
				}

			},

			//live search in employees list
			livechange: function (oEvent) {
				//This code was generated by the layout editor.
				var data = oEvent.getSource().getValue();

				var oFilter = new sap.ui.model.Filter("FullName",
					sap.ui.model.FilterOperator.Contains,
					data);
				var oElement = this.getView().byId("list");
				var oBinding = oElement.getBinding("items");
				oBinding.filter([oFilter]);
			},

			//Count number of requests waintig approval to every employee
		  RequestCount: function (oValue, oEvent) 
		 {
		 
				var m = this.getView().getModel();

				var items = this.byId("list").getItems();

				for (var item_index = 0; item_index < items.length; item_index++) {
					var item = items[item_index];

					(function (_item) {

						$.get(
							m.sServiceUrl + _item.getBindingContextPath() + "/EMtoReq/$count?$filter=Status eq 'waiting Approval' ",
							function (count) {

								_item.setNumber(count);
								return count;
								console.log(count);
							}
						);

					})(item);

				}

			},
			//open filter bar 
			onOpenViewSettings: function () {
				if (!this._oViewSettingsDialog) {
					this._oViewSettingsDialog = sap.ui.xmlfragment("com.sap.build.standard.approveLeaveRequests.view.TriMaster", this);
					this.getView().addDependent(this._oViewSettingsDialog);
					// forward compact/cozy style into Dialog
					this._oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				}
				this._oViewSettingsDialog.open();
			},
			//when confirm filter 
			onConfirmViewSettingsDialog: function (oEvent) {
				var m = this.getView().getModel();
				var items = this.byId("list").getItems();
				var aFilterItems = oEvent.getParameters().filterItems,
					aFilters = [],
					aCaptions = [];

				aFilterItems.forEach(function (oItem) {

					for (var item_index = 0; item_index < items.length; item_index++) {
						var item = items[item_index];

						(function (_item) {

							aFilters.push($.get(
								m.sServiceUrl + _item.getBindingContextPath() + "/EMtoReq/$count?$filter=Status eq " + oItem.getText(),
								function (count) {

									if (count > 0) {

										_item.setVisible(true);
									} else {

										_item.setVisible(false);
									}

								}

							));
						})(item);

					}

				});

				if (aFilters.length === 0) {
					for (var item_index = 0; item_index < items.length; item_index++) {
						var item = items[item_index];
						item.setVisible(true);
					}
				}else {

			this.getView().byId("list").setText("noDataText");
			
				}
			}

		});
	}, /* bExport= */
	true);