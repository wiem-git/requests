sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./D1_1461330792983",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, MessageBox, D1_1461330792983, Utilities, History, ResourceModel, Filter, FilterOperator) {
	"use strict";
	return BaseController.extend("com.sap.build.standard.approveLeaveRequests.controller.RequestDetail", {
		handleRouteMatched: function (oEvent) {
			var sAppId = "App5df787e350972b45719e4ab4";
			var oParams = {};
			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;
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
					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);
				}
			}
			var oPath;
			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}
		},
		
		//To setEnable buttons case on requests status
		onUpdateFinished : function(){
			this.byId("__table1").getBinding("items").refresh();
				var oTable = this.getView().byId("__table1");
				var oSelectedItems = oTable.getSelectedItems();
			var oModel = this.getOwnerComponent().getModel();
			var itemIndex = oTable.indexOfItem(oTable.getSelectedItem());
		
				if (oSelectedItems.length > 0) {
			if (itemIndex !== -1) {
				var oItems = oTable.getSelectedItems();
				for (var i = 0; i < oItems.length; i++) {
					var status = oItems[i].getBindingContext().getProperty("Status");
				
				}
			}
				}
				if (status == "Approved" || status == "Rejected" || status == "Canceled"){
					this.getView().byId("Edit").setEnabled(false);
					this.getView().byId("delete").setEnabled(false);
				}else{
					this.getView().byId("Edit").setEnabled(true);
					this.getView().byId("delete").setEnabled(true);	
				}
		},
		
	//filter table with filter specifications
			_onOverflowToolbarButtonPress: function(oEvent) {

			this.mSettingsDialogs = this.mSettingsDialogs || {};
			var sSourceId = oEvent.getSource().getId();
			var oDialog = this.mSettingsDialogs["ViewSettingsDialog1"];

			var confirmHandler = function(oConfirmEvent) {
				var self = this;
				var sFilterString = oConfirmEvent.getParameter('filterString');
				var oBindingData = {};

				/* Filtering */
				oBindingData.filters = [];
			
				// Simple filters (String)
				var mSimpleFilters = {},
					sKey;
				for (sKey in oConfirmEvent.getParameter("filterKeys")) {
					var aSplit = sKey.split("___");
					alert(aSplit);
					var sPath = aSplit[1];
					alert(sPath);
					var sValue1 = aSplit[2];
					alert(sValue1);
					var oFilterInfo = new sap.ui.model.Filter(sPath, "EQ", sValue1);
                     alert(oFilterInfo);
					// Creating a map of filters for each path
					if (!mSimpleFilters[sPath]) {
						mSimpleFilters[sPath] = [oFilterInfo];
					} else {
						mSimpleFilters[sPath].push(oFilterInfo);
					}
				}

				for (var path in mSimpleFilters) {
					// All filters on a same path are combined with a OR
					oBindingData.filters.push(new sap.ui.model.Filter(mSimpleFilters[path], false));
				}

				aCollections.forEach(function(oCollectionItem) {
					var oCollection = self.getView().byId(oCollectionItem.id);
					var oBindingInfo = oCollection.getBindingInfo(oCollectionItem.aggregation);
					var oBindingOptions = this.updateBindingOptions(oCollectionItem.id, oBindingData, sSourceId);
					if (oBindingInfo.model === "kpiModel") {
						oCollection.getObjectBinding().refresh();
					} else {
						oCollection.bindAggregation(oCollectionItem.aggregation, {
							model: oBindingInfo.model,
							path: oBindingInfo.path,
							parameters: oBindingInfo.parameters,
							template: oBindingInfo.template,
							templateShareable: true,
							sorter: oBindingOptions.sorters,
							filters: oBindingOptions.filters
						});
					}

					// Display the filter string if necessary
					if (typeof oCollection.getInfoToolbar === "function") {
						var oToolBar = oCollection.getInfoToolbar();
						if (oToolBar && oToolBar.getContent().length === 1) {
							oToolBar.setVisible(!!sFilterString);
							oToolBar.getContent()[0].setText(sFilterString);
						}
					}
				}, this);
			}.bind(this);

			function resetFiltersHandler() {

			}

			function updateDialogData(filters) {
				var mParams = {
					context: oReferenceCollection.getBindingContext(),
					success: function(oData) {
						var oJsonModelDialogData = {};
						// Loop through each entity
						oData.results.forEach(function(oEntity) {
							// Add the distinct properties in a map
							for (var oKey in oEntity) {
								if (!oJsonModelDialogData[oKey]) {
									oJsonModelDialogData[oKey] = [oEntity[oKey]];
								} else if (oJsonModelDialogData[oKey].indexOf(oEntity[oKey]) === -1) {
									oJsonModelDialogData[oKey].push(oEntity[oKey]);
								}
							}
						});

						var oDialogModel = oDialog.getModel();

						if (!oDialogModel) {
							oDialogModel = new sap.ui.model.json.JSONModel();
							oDialog.setModel(oDialogModel);
						}
						oDialogModel.setData(oJsonModelDialogData);
						oDialog.open();
					}
				};
				var sPath;
				var sModelName = oReferenceCollection.getBindingInfo(aCollections[0].aggregation).model;
				// In KPI mode for charts, getBindingInfo would return the local JSONModel
				if (sModelName === "kpiModel") {
					sPath = oReferenceCollection.getObjectBinding().getPath();
				} else {
					sPath = oReferenceCollection.getBindingInfo(aCollections[0].aggregation).path;
				}
				mParams.filters = filters;
				oModel.read(sPath, mParams);
			}

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment({
					fragmentName: "com.sap.build.standard.approveLeaveRequests.view.ViewSettingsDialog1"
				}, this);
				oDialog.attachEvent("confirm", confirmHandler);
				oDialog.attachEvent("resetFilters", resetFiltersHandler);

				this.mSettingsDialogs.ViewSettingsDialog1 = oDialog;
			}

			var aCollections = [];

			aCollections.push({
				id: "__table1",
				aggregation: "items"
			});

			var oReferenceCollection = this.getView().byId(aCollections[0].id);
			var oSourceBindingContext = oReferenceCollection.getBindingContext();
			var oModel = oSourceBindingContext ? oSourceBindingContext.getModel() : this.getView().getModel();

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
			var designTimeFilters = this.mBindingOptions && this.mBindingOptions[aCollections[0].id] && this.mBindingOptions[aCollections[0].id].filters && this.mBindingOptions[aCollections[0].id].filters[undefined];
			updateDialogData(designTimeFilters);

		},
		
		updateBindingOptions: function (sCollectionId, oBindingData, sSourceId) {
		
			this.mBindingOptions = this.mBindingOptions || {};
			this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};
			var aSorters = this.mBindingOptions[sCollectionId].sorters;
			var aGroupby = this.mBindingOptions[sCollectionId].groupby;
			// If there is no oBindingData parameter, we just need the processed filters and sorters from this function
			if (oBindingData) {
				if (oBindingData.sorters) {
					aSorters = oBindingData.sorters;
				}
				if (oBindingData.groupby || oBindingData.groupby === null) {
					aGroupby = oBindingData.groupby;
				}
				// 1) Update the filters map for the given collection and source
				this.mBindingOptions[sCollectionId].sorters = aSorters;
				this.mBindingOptions[sCollectionId].groupby = aGroupby;
				this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
				this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];
			}
			// 2) Reapply all the filters and sorters
			var aFilters = [];
			for (var key in this.mBindingOptions[sCollectionId].filters) {
				aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
			}
			// Add the groupby first in the sorters array
			if (aGroupby) {
				aSorters = aSorters ? aGroupby.concat(aSorters) : aGroupby;
			}
			var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
			return {
				filters: aFinalFilters,
				sorters: aSorters
			};
		},
		
		//check status of request
		status: function (Status) {
			if (Status === "waiting Approval") {
				return true;
			} else {
				return false;
			}
		},
		
		// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
		onExit: function () {
				var aControls = [{
				"controlId": "sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1-content-build_simple_Table-1576503465747",
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
		
		//Navigate To DetailRequest
		_onLinkPress: function (oEvent) {
			var oTable = this.getView().byId("__table1");
				var oSelectedItems = oTable.getSelectedItems();
			var oModel = this.getOwnerComponent().getModel();
			var itemIndex = oTable.indexOfItem(oTable.getSelectedItem());
		
				if (oSelectedItems.length > 0) {
			if (itemIndex !== -1) {
				var oItems = oTable.getSelectedItems();
				for (var i = 0; i < oItems.length; i++) {
					var value = oItems[i].getBindingContext().getProperty("ID");
					
				}
			}
			// Tell the Router to Navigate To DetailRequest
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("DetailRequest", {
				SelectedItem: value
			});
				}else {
				sap.m.MessageBox.show(this.getView().getModel("i18n").getResourceBundle().getText("Pleaseselectarowtodelete!"), {
					icon: sap.m.MessageBox.Icon.WARNING,
					title: "Note!"
				});
			}
		},
		
		//Navigate To EditRequest
		_onButtonPress: function (oEvent) {
			var oTable = this.getView().byId("__table1");
				var oSelectedItems = oTable.getSelectedItems();
			var oModel = this.getOwnerComponent().getModel();
			var itemIndex = oTable.indexOfItem(oTable.getSelectedItem());
				if (oSelectedItems.length > 0) {
			if (itemIndex !== -1) {
				var oItems = oTable.getSelectedItems();
				for (var i = 0; i < oItems.length; i++) {
					var value = oItems[i].getBindingContext().getProperty("ID");
				}
			}
			// Tell the Router to Navigate To EditRequest
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("EditRequest", {
				SelectedItem: value
			});
				}else {
				sap.m.MessageBox.show(this.getView().getModel("i18n").getResourceBundle().getText("Pleaseselectarowtodelete!"), {
					icon: sap.m.MessageBox.Icon.WARNING,
					title: "Note!"
				});
			}
				
		},
		//Button delete:to remove request
		_onButtonPress1: function (oEvent) {
				var oTable = this.getView().byId("__table1");
			var oSelectedItems = oTable.getSelectedItems();
			if (oSelectedItems.length > 0) {
			var sDialogName = "D1_1461330792983";
			this.mDialogs = this.mDialogs || {};
			var oPopover = this.mDialogs[sDialogName];
			if (!oPopover) {
				oPopover = new D1_1461330792983(this.getView());
				this.mDialogs[sDialogName] = oPopover;
				// For navigation.
				oPopover.setRouter(this.oRouter);
			}
			var context = oEvent.getSource().getBindingContext();
			oPopover._oControl.setBindingContext(context);
			oPopover.open();
			}
			else {
				sap.m.MessageBox.show(this.getView().getModel("i18n").getResourceBundle().getText("Pleaseselectarowtodelete!"), {
					icon: sap.m.MessageBox.Icon.WARNING,
					title: "Note!"
				});
			}
		},
		
		//Naviagate to Add Request
		_onButtonPress2: function (oEvent) {
			var up = oEvent.getSource().getBindingContext().getProperty("ID");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("AddRequest", {
				SelectedItem: up
			});
			
		},
	
		onInit: function () {
		
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("RequestDetail").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
        
			var oView = this.getView();
			oView.addEventDelegate({
				onBeforeShow: function () {
					if (sap.ui.Device.system.phone) {
						var oPage = oView.getContent()[0];
						oPage.refresh(true);
						if (oPage.getShowNavButton && !oPage.getShowNavButton()) {
							oPage.setShowNavButton(true);
							oPage.attachNavButtonPress(function () {
								this.oRouter.navTo("RequestsMaster", {}, true);
							}.bind(this));
						}
					}
				}.bind(this)
			});
	
		}

	
	
	});
}, true);