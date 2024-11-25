//path: controllers/customerController.js

const Customer = require("../models/Customer");

const customerController = {
  async getAll(req, res) {
    try {
      const customers = await Customer.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers", error });
    }
  },

  async getById(req, res) {
    const { id } = req.params;
    try {
      const customer = await Customer.getCustomerById(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer by ID:", error);
      res.status(500).json({ message: "Failed to fetch customer", error });
    }
  },

  async create(req, res) {
    try {
      const newCustomer = await Customer.createCustomer(req.body);
      res.status(201).json(newCustomer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer", error });
    }
  },

  async update(req, res) {
    const { id } = req.params;
    try {
      const updatedCustomer = await Customer.updateCustomer(id, req.body);
      if (!updatedCustomer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(updatedCustomer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer", error });
    }
  },

  async delete(req, res) {
    const { id } = req.params;
    try {
      const deletedCustomer = await Customer.deleteCustomer(id);
      if (!deletedCustomer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(deletedCustomer);
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer", error });
    }
  },
};

module.exports = customerController;
