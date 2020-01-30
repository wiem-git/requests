sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function (ManagedObject, MessageBox, Utilities, History) {

	return ManagedObject.extend("com.sap.build.standard.approveLeaveRequests.controller.D1_1461330792983", {
		constructor: function (oView) {
			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "com.sap.build.standard.approveLeaveRequests.view.D1_1461330792983", this);
			this._bInit = false;
		},

		exit: function () {
			delete this._oView;
		},

		getView: function () {
			return this._oView;
		},

		getControl: function () {
			return this._oControl;
		},

		getOwnerComponent: function () {
			return this._oView.getController().getOwnerComponent();
		},

		open: function () {
			var oView = this._oView;
			var oControl = this._oControl;

			if (!this._bInit) {

				// Initialize our fragment
				this.onInit();

				this._bInit = true;

				// connect fragment to the root view of this component (models, lifecycle)
				oView.addDependent(oControl);
			}

			var args = Array.prototype.slice.call(arguments);
			if (oControl.open) {
				oControl.open.apply(oControl, args);
			} else if (oControl.openBy) {
				oControl.openBy.apply(oControl, args);
			}
		},

		close: function () {
			this._oControl.close();
		},

		setRouter: function (oRouter) {
			this.oRouter = oRouter;

		},
		getBindingParameters: function () {
			return {};

		},
		//button delete:to delete a request
		_onButtonPress: function (oEvent) {
			this.close();
			var oTable = this.getView().byId("__table1");
			var oModel = this.getOwnerComponent().getModel();
			var itemIndex = oTable.indexOfItem(oTable.getSelectedItem());
        	var error = this.getView().getModel("i18n").getResourceBundle().getText("OopsSomethingwrongtoDelete.");
			var success = this.getView().getModel("i18n").getResourceBundle().getText("Canceledsuccessfully!");
			var oops = this.getView().getModel("i18n").getResourceBundle().getText("Oops!");
			var info = this.getView().getModel("i18n").getResourceBundle().getText("Info");
			var hello=this.getView().getModel("i18n").getResourceBundle().getText("helloMsg");
	
			if (itemIndex !== -1) {

				var oItems = oTable.getSelectedItems();

				for (var i = 0; i < oItems.length; i++) {

					var value = oItems[i].getBindingContext().getProperty("ID");

				}

			}
			if (oItems.length > 0) {
					var oEntry = {};
	
			oEntry.Status = "Canceled";
			 oEntry.Approvedby = oEvent.getSource().getBindingContext().getProperty("FullName");
				oModel.update("/RequestsSet('" + value + "')",oEntry, {
					success: function () {
						sap.m.MessageBox.show(success, {
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: info
						});
					},
					error: function () {
						sap.m.MessageBox.show(error, {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: oops
						});
					}
				});
			} else {

				sap.m.MessageBox.show(hello, {
					icon: sap.m.MessageBox.Icon.WARNING,
					title: hello
				});
			}

		},
		_onButtonPress1: function () {

			this.close();

		},
		onInit: function () {

			this._oDialog = this.getControl();

		},
		onExit: function () {
			this._oDialog.destroy();

		}

	});
}, /* bExport= */ true);