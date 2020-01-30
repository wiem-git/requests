sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("com.sap.build.standard.approveLeaveRequests.controller.EditRequest", {

		onInit: function () {
			var oModel = new sap.ui.model.odata.v2.ODataModel("localService");
			sap.ui.getCore().setModel(oModel, "myModel");

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("EditRequest").attachMatched(jQuery.proxy(this._onRouteFound, this));

			var oModel = this.getOwnerComponent().getModel();
			oModel.refresh(true);
		},
		
		//Recuper Id of request to modify
		_onRouteFound: function (oEvent) {
			var oArgument = oEvent.getParameter("arguments");

			var oView = this.getView();

			oView.bindObject({
				path: "/RequestsSet('" + oArgument.SelectedItem + "')"

			});

		},

		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

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
        //button save:to save modification(s)
		_onButtonPress: function (oEvent) {
		var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	
		var error =	this.getView().getModel("i18n").getResourceBundle().getText("SorryCannotUpdatetheRequestPleasetryagainlater.");
		var success = this.getView().getModel("i18n").getResourceBundle().getText("successfullyUpdated!");
		var oops = this.getView().getModel("i18n").getResourceBundle().getText("Oops!");
		var info = this.getView().getModel("i18n").getResourceBundle().getText("Info");
			var oModel = this.getOwnerComponent().getModel();
		
			var oEntry = {};
				var invaliddate = this.getView().getModel("i18n").getResourceBundle().getText("Invaliddates");

			oEntry.ID = oEvent.getSource().getBindingContext().getProperty("ID");
			oEntry.Reason = this.getView().byId("Reason").getValue();
         	oEntry.StartDate = this.getView().byId("StartDate").getValue();
			oEntry.EndDate = this.getView().byId("EndDate").getValue();
		
				if (this.getView().byId("StartDate").getValue() >= this.getView().byId("EndDate").getValue()) {
					sap.m.MessageBox.show(invaliddate, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: oops
					});
				}else{
		oModel.update("/RequestsSet('" + oEvent.getSource().getBindingContext().getProperty("ID") + "')", oEntry, {
				success: function () {
					sap.m.MessageBox.show(success, {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: info,
					onClose: function (oAction) {

								// Tell the Router to Navigate To RequestDetail
								oRouter.navTo("RequestDetail");
							}
					});
			
				},
				error: function () {
					sap.m.MessageBox.show(error, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: oops
					});
				}
			});
		
				}
				
		},
		// Tell the Router to Navigate To DetailRequest
		_onButtonPress1: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	
			oRouter.navTo("RequestDetail");
		},
	// Tell the Router to Navigate To DetailRequest with nav button
		_onPageNavButtonPress: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	
			oRouter.navTo("RequestDetail");
		}
	});

});