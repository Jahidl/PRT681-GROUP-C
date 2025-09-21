import React, { useState, useEffect, useCallback } from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import type { GridCellProps } from "@progress/kendo-react-grid";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Form, Field, FormElement } from "@progress/kendo-react-form";
import { Input, NumericTextBox, Checkbox } from "@progress/kendo-react-inputs";
import { Notification, NotificationGroup } from "@progress/kendo-react-notification";
import type { Category } from "../types/category";
import { CategoryService } from "../services/categoryService";

interface CategoryFormData {
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    message: string;
    type: "success" | "error" | "info";
  }>>([]);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CategoryService.getCategories();
      setCategories(data);
    } catch (error) {
      addNotification("Error loading categories", "error");
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const addNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    const notification = {
      id: Date.now(),
      message,
      type,
    };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setShowDialog(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowDialog(true);
  };

  const handleDelete = async (category: Category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        await CategoryService.deleteCategory(category.id);
        addNotification("Category deleted successfully", "success");
        loadCategories();
      } catch (error) {
        addNotification("Error deleting category", "error");
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleSubmit = async (values: { [name: string]: unknown }) => {
    const data = values as unknown as CategoryFormData;
    try {
      if (editingCategory) {
        await CategoryService.updateCategory(editingCategory.id, data);
        addNotification("Category updated successfully", "success");
      } else {
        await CategoryService.createCategory(data);
        addNotification("Category created successfully", "success");
      }
      setShowDialog(false);
      loadCategories();
    } catch (error) {
      addNotification(
        editingCategory ? "Error updating category" : "Error creating category",
        "error"
      );
      console.error("Error saving category:", error);
    }
  };

  const ActionCell = (props: GridCellProps) => {
    const category = props.dataItem as Category;
    return (
      <td className="k-command-cell">
        <Button
          type="button"
          themeColor="primary"
          size="small"
          onClick={() => handleEdit(category)}
          style={{ marginRight: "8px" }}
        >
          Edit
        </Button>
        <Button
          type="button"
          themeColor="error"
          size="small"
          onClick={() => handleDelete(category)}
        >
          Delete
        </Button>
      </td>
    );
  };

  const StatusCell = (props: GridCellProps) => {
    const isActive = props.dataItem.isActive;
    return (
      <td>
        <span
          className={`k-badge ${isActive ? "k-badge-success" : "k-badge-error"}`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </td>
    );
  };

  const initialFormData: CategoryFormData = {
    name: editingCategory?.name || "",
    description: editingCategory?.description || "",
    image: editingCategory?.image || "",
    isActive: editingCategory?.isActive ?? true,
    sortOrder: editingCategory?.sortOrder || 0,
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Category Management</h1>
          <Button
            type="button"
            themeColor="primary"
            size="large"
            onClick={handleCreate}
          >
            Add New Category
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading categories...</div>
            </div>
          ) : (
            <Grid
              data={categories}
              pageable={{
                buttonCount: 5,
                info: true,
                type: "numeric",
                pageSizes: [10, 20, 50],
                previousNext: true,
              }}
              sortable
              filterable
              style={{ height: "600px" }}
            >
              <GridColumn field="name" title="Name" width="200px" />
              <GridColumn field="description" title="Description" width="300px" />
              <GridColumn field="image" title="Image URL" width="250px" />
              <GridColumn
                field="isActive"
                title="Status"
                width="120px"
                cells={{ data: StatusCell }}
                filterable={false}
              />
              <GridColumn
                field="sortOrder"
                title="Sort Order"
                width="120px"
                filter="numeric"
              />
              <GridColumn
                title="Actions"
                width="180px"
                cells={{ data: ActionCell }}
                filterable={false}
                sortable={false}
              />
            </Grid>
          )}
        </div>

        {showDialog && (
          <Dialog
            title={editingCategory ? "Edit Category" : "Create New Category"}
            onClose={() => setShowDialog(false)}
            width={500}
          >
            <Form
              onSubmit={handleSubmit}
              initialValues={initialFormData}
              render={(formRenderProps) => (
                <FormElement style={{ maxWidth: 650 }}>
                  <fieldset className="k-form-fieldset">
                    <div className="mb-3">
                      <Field
                        name="name"
                        component={Input}
                        label="Category Name"
                        required
                        validator={(value) =>
                          !value ? "Category name is required" : ""
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <Field
                        name="description"
                        component={Input}
                        label="Description"
                        required
                        validator={(value) =>
                          !value ? "Description is required" : ""
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <Field
                        name="image"
                        component={Input}
                        label="Image URL"
                        required
                        validator={(value) =>
                          !value ? "Image URL is required" : ""
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <Field
                        name="sortOrder"
                        component={NumericTextBox}
                        label="Sort Order"
                        min={0}
                        format="n0"
                      />
                    </div>
                    <div className="mb-3">
                      <Field
                        name="isActive"
                        component={Checkbox}
                        label="Active"
                      />
                    </div>
                  </fieldset>
                  <DialogActionsBar>
                    <Button
                      type="button"
                      onClick={() => setShowDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      themeColor="primary"
                      disabled={!formRenderProps.allowSubmit}
                    >
                      {editingCategory ? "Update" : "Create"}
                    </Button>
                  </DialogActionsBar>
                </FormElement>
              )}
            />
          </Dialog>
        )}

        <NotificationGroup
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1000,
          }}
        >
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              type={{
                style: notification.type,
                icon: true,
              }}
              closable
              onClose={() =>
                setNotifications(prev =>
                  prev.filter(n => n.id !== notification.id)
                )
              }
            >
              <span>{notification.message}</span>
            </Notification>
          ))}
        </NotificationGroup>
      </div>
    </div>
  );
};

export default CategoryManagement;
