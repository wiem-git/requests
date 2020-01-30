sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.sap.build.standard.approveLeaveRequests.controller.RejectRequest", {

		getValue: function (oEvent) {
			var reasonreject = this.getView().byId("RejectionType").getSelectedItem().getText();

			if (reasonreject === "Autre") {
				this.getView().byId("cause").setVisible(true);
			}
		},
		//button Save:to reject the request
		_onButtonPress: function (oEvent) {
		
		
			var error = this.getView().getModel("i18n").getResourceBundle().getText("SorryCannotRejectetheRequest!");
			var success = this.getView().getModel("i18n").getResourceBundle().getText("successfullyRejected!");
			var oops = this.getView().getModel("i18n").getResourceBundle().getText("Oops!");
			var info = this.getView().getModel("i18n").getResourceBundle().getText("Info");
			var reqmandatory = this.getView().getModel("i18n").getResourceBundle().getText("Reqonofrejectismandatory");
			var mandatory = this.getView().getModel("i18n").getResourceBundle().getText("Mandatory");
			var oModel = this.getOwnerComponent().getModel();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oEntry = {};
				if(this.getView().byId("RejectionType").getSelectedItem() === null){
				oEntry.RejectionType=null;
			}
			else{
					oEntry.RejectionType = this.getView().byId("RejectionType").getSelectedItem().getText();
			}
			oEntry.Reason = this.getView().byId("Reason").getValue();
		
			oEntry.Status = "Rejected";
   	       oEntry.Approvedby="Arous Elyes";
			if (this.getView().byId("RejectionType").getSelectedItem() === null) {
				sap.m.MessageBox.show(mandatory, {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: info
				});
			}

		else if (oEntry.RejectionType === "Autre" && oEntry.Reason === "") {

			sap.m.MessageBox.show(reqmandatory, {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: info
			});
}
			else {
				oModel.update("/RequestsSet('" + oEvent.getSource().getBindingContext().getProperty("ID") + "')", oEntry, {
					success: function () {
						sap.m.MessageBox.show(success, {
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: info,
							onClose: function (oAction) {

								// Tell the Router to Navigate To DetailRequest
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

		onInit: function () {
			var oModel = new sap.ui.model.odata.v2.ODataModel("localService");
			sap.ui.getCore().setModel(oModel, "myModel");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RejectRequest").attachMatched(jQuery.proxy(this._onRouteFound, this));
			oModel.refresh(true);
		},

		//To recuper Id of request
		_onRouteFound: function (oEvent) {
			var oArgument = oEvent.getParameter("arguments");

			var oView = this.getView();

			oView.bindObject({
				path: "/RequestsSet('" + oArgument.SelectedItem + "')"

			});

			//To initialize the view
			this.getView().byId("Reason").setValue("");
			this.getView().byId("RejectionType").setSelectedItem(null);
			this.getView().byId("cause").setVisible(false);
		}

	});

});