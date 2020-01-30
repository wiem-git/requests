sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";
	return Controller.extend("com.sap.build.standard.approveLeaveRequests.controller.DetailRequest", {
		onInit: function () {
			var oModel = new sap.ui.model.odata.v2.ODataModel("localService");
			sap.ui.getCore().setModel(oModel, "myModel");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("DetailRequest").attachMatched(jQuery.proxy(this._onRouteFound, this));
			var oModel = this.getOwnerComponent().getModel();
			oModel.refresh(true);
		},
		_onRouteFound: function (oEvent) {
			var oArgument = oEvent.getParameter("arguments");
			var oView = this.getView();
			oView.bindObject({
				path: "/RequestsSet('" + oArgument.SelectedItem + "')"
			});
		},
		onExit: function () {
			// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
			var aControls = [{
				"controlId": "sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1-content-build_simple_form_Form-1499729016800-formContainers-build_simple_form_FormContainer-1-formElements-build_simple_form_FormElement-2-fields-sap_m_ComboBox-1",
				"groups": ["items"]
			}, {
				"controlId": "sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1462194241499-content-sap_m_List-1462194854286",
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
		_onPageNavButtonPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			return new Promise(function (fnResolve) {
				this.doNavigate("RequestDetail", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		//Tell the router to navigate:Approve Request
		_onButtonPress: function (oEvent) {
			var up = oEvent.getSource().getBindingContext().getProperty("ID");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ApproveRequest", {
				SelectedItem: up
			});
		},
			//Tell the router to navigate:RejectRequest
		_onButtonPress1: function (oEvent) {
			var up = oEvent.getSource().getBindingContext().getProperty("ID");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RejectRequest", {
				SelectedItem: up
			});
		},
			//Tell the router to navigate back :RequestDetail
		navback: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// Tell the Router to Navigate To DetailRequest
			oRouter.navTo("RequestDetail");
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
	//disable buttons iin case of request "Approved" "Rejected" "Canceled"
		disablebutton: function (oEvent) {
		
				var upstatus = this.getView().byId("status").getText();
	
				
	if (upstatus== "Approved" || upstatus== "Rejected" || upstatus== "Canceled"){
	
					this.getView().byId("approve").setEnabled(false);
					this.getView().byId("reject").setEnabled(false);
				}else{
					this.getView().byId("approve").setEnabled(true);
					this.getView().byId("reject").setEnabled(true);
				}
				if (upstatus== "Rejected"){
				this.getView().byId("rejected").setVisible(true);	
				}
		}
		
	});
});