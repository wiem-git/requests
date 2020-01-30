sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"sap/ui/model/json/JSONModel"
	], function (Controller, MessageBox, JSONModel) {
		"use strict";
		return Controller.extend("com.sap.build.standard.approveLeaveRequests.controller.AddRequest", {
			/**
			 * Called when a controller is instantiated and its View controls (if available) are already created.
			 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			 * @memberOf com.sap.build.standard.approveLeaveRequests.view.AddRequest
			 */
			onInit: function () {

				var oModel = new sap.ui.model.odata.v2.ODataModel("localService");
				sap.ui.getCore().setModel(oModel, "myModel");

				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.getRoute("AddRequest").attachMatched(jQuery.proxy(this._onRouteFound, this));

				sap.ui.getCore().getMessageManager().registerObject(this.oView.byId("StartDate"), true);
				sap.ui.getCore().getMessageManager().registerObject(this.oView.byId("EndDate"), true);
			},
			//function used to initialize the view 
			onBeforeRendering: function (oEvent) {
				this.getView().byId("title").setValue("");
				this.getView().byId("RequestType").setValue("");
				this.getView().byId("Reason").setValue("");
				this.getView().byId("StartDate").setValue("");
				this.getView().byId("EndDate").setValue("");
				this.getView().byId("system").setValue("");
				this.getView().byId("StratosTicket").setValue("");
			},
			//to recuper the id of employee selected
			_onRouteFound: function (oEvent) {
				var oArgument = oEvent.getParameter("arguments");
				var oView = this.getView();
				oView.bindObject({
					path: "/RequestsSet('" + oArgument.SelectedItem + "')"
				});

			},
			//To verify date validity
			verifydate: function (oEvent) {
				var info = this.getView().getModel("i18n").getResourceBundle().getText("Info");
				var bValid = oEvent.getParameter("valid");
				var invaliddate = this.getView().getModel("i18n").getResourceBundle().getText("Invaliddates");
				if (!bValid) {
					sap.m.MessageBox.show(invaliddate, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: info
					});
					return;
				}
			},

			//	//button Save:to add a request
			_onButtonPress: function (oEvent) {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				var error = this.getView().getModel("i18n").getResourceBundle().getText("SorryCannotAddtheRequest!");
				var success = this.getView().getModel("i18n").getResourceBundle().getText("successfullyAdded!");
				var oops = this.getView().getModel("i18n").getResourceBundle().getText("Oops!");
				var info = this.getView().getModel("i18n").getResourceBundle().getText("Info");
				var typereqmandatory = this.getView().getModel("i18n").getResourceBundle().getText("Typeofrequestismandatory");
				var titlemandatory = this.getView().getModel("i18n").getResourceBundle().getText("Titleofrequestismandatory");
				var invaliddate = this.getView().getModel("i18n").getResourceBundle().getText("Invaliddates");
				var enddate = this.getView().getModel("i18n").getResourceBundle().getText("Enddateofrequestismandatory");
				var startdate = this.getView().getModel("i18n").getResourceBundle().getText("Startdateofrequestismandatory");
				var systemmandatory = this.getView().getModel("i18n").getResourceBundle().getText("systemmandatory");
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "YYYY/MM/dd hh:mm "
				});
				
				var dateFormatted = dateFormat.format(new Date());
			
				var oModel = this.getOwnerComponent().getModel();
				var id = oEvent.getSource().getBindingContext().getProperty("ID");

				var oEntry = {};
				oEntry.ID = "50";
				oEntry.LeaveType = this.getView().byId("RequestType").getValue();
				oEntry.titleofrequest = this.getView().byId("title").getValue();
				oEntry.Reason = this.getView().byId("Reason").getValue();
				oEntry.Status = "waiting Approval";
				oEntry.StartDate = this.getView().byId("StartDate").getValue();
				oEntry.EndDate = this.getView().byId("EndDate").getValue();
				oEntry.System = this.getView().byId("system").getValue();
				oEntry.StratosTicket = this.getView().byId("StratosTicket").getValue();

				oEntry.DateSubmitted = dateFormatted;
				oEntry.___FK_866937bf8055db3812ba5b07_00001 = id;

				if (oEntry.LeaveType == "") {
					sap.m.MessageBox.show(typereqmandatory, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: info
					});
				} else if (oEntry.titleofrequest == "") {
					sap.m.MessageBox.show(titlemandatory, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: oops
					});
				} else if (oEntry.StartDate == "") {
					sap.m.MessageBox.show(startdate, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: oops
					});
				} else if (oEntry.EndDate == "") {
					sap.m.MessageBox.show(enddate, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: oops
					});
				} else if (oEntry.StartDate > oEntry.EndDate) {
				
					sap.m.MessageBox.show(invaliddate, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: oops
					});
				} else if (oEntry.StartDate < dateFormatted) {
				
					sap.m.MessageBox.show(invaliddate, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: oops
					});
				}else if(this.getView().byId("systemvisible").getVisible() === true &&	oEntry.System  === "")
				{
					
					sap.m.MessageBox.show(systemmandatory, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: oops
					});	
				}else {
					oModel.create("/RequestsSet", oEntry, {
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
								title: error
							});
						}
					});
			
				}
			},
			// Tell the Router to Navigate To DetailRequest
			_onButtonPress1: function (oEvent) {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				// Tell the Router to Navigate To DetailRequest
				oRouter.navTo("RequestDetail");
			},
			// Tell the Router to Navigate To DetailRequest with nav button
			_onPageNavButtonPress: function (oEvent) {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				// Tell the Router to Navigate To DetailRequest
				oRouter.navTo("RequestDetail");
			},

			//system is mandatory in case SE16n selected
			affichesysteme: function (oEvent) {
				//This code was generated by the layout editor.

				if (this.getView().byId("RequestType").getValue() === "SE16n") {
					this.getView().byId("systemvisible").setVisible(true);
				} else {
					this.getView().byId("systemvisible").setVisible(false);
				}
			}
		});
	}, /* bExport= */
	true);