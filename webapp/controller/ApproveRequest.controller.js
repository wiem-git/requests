sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.sap.build.standard.approveLeaveRequests.controller.ApproveRequest", {
		// Tell the Router to Navigate To DetailRequest
		_onPageNavButtonPress: function (oEvent) {
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
		//button Save:to approve a request
		_onButtonPress: function (oEvent) {
			var notapproved = this.getView().getModel("i18n").getResourceBundle().getText("SorryCannotApprovetheRequest!");
			var approved = this.getView().getModel("i18n").getResourceBundle().getText("successfullyApproved");
			var oops = this.getView().getModel("i18n").getResourceBundle().getText("Oops!");
			var info = this.getView().getModel("i18n").getResourceBundle().getText("Info");
			var oModel = this.getOwnerComponent().getModel();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oEntry = {};
			oEntry.Reason = this.getView().byId("Reason").getValue();
			oEntry.Status = "Approved";
			oEntry.Approvedby="Arous Elyes";
			oModel.update("/RequestsSet('" + oEvent.getSource().getBindingContext().getProperty("ID") + "')", oEntry, {
				success: function () {
					sap.m.MessageBox.show(approved, {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: info,
						onClose: function (oAction) {
alert("approved succefully");
							// Tell the Router to Navigate To RequestDetail
							oRouter.navTo("RequestDetail");
						}

					});

				},
				error: function () {
					sap.m.MessageBox.show(notapproved, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: oops
					});
				}
			});

		},
				// Tell the Router to Navigate To DetailRequest
		_onButtonPress1: function (oEvent) {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	
			oRouter.navTo("RequestDetail");
		},
		onInit: function () {

			var oModel = new sap.ui.model.odata.v2.ODataModel("localService");
			sap.ui.getCore().setModel(oModel, "myModel");

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("ApproveRequest").attachMatched(jQuery.proxy(this._onRouteFound, this));

			var oModel = this.getOwnerComponent().getModel();
			oModel.refresh(true);
		},
		//to recuper Id of request to be approved
		_onRouteFound: function (oEvent) {
			var oArgument = oEvent.getParameter("arguments");

			var oView = this.getView();
			oView.bindObject({
				path: "/RequestsSet('" + oArgument.SelectedItem + "')"

			});
			this.getView().byId("Reason").setValue("");
		}

	});

});