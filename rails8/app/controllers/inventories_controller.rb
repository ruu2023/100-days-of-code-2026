class InventoriesController < ApplicationController
  before_action :set_inventory, only: %i[show edit update destroy]

  def index
    @inventories = Inventory.order(:code)
    @inventory = Inventory.new
  end

  def show
  end

  def new
    @inventory = Inventory.new
  end

  def edit
    render partial: "edit_form", locals: { inventory: @inventory }
  end

  def create
    @inventory = Inventory.new(inventory_params)

    respond_to do |format|
      if @inventory.save
        format.turbo_stream
        format.html { redirect_to inventories_path, notice: "Inventory item was successfully created." }
      else
        format.turbo_stream { render turbo_stream: turbo_stream.replace("inventory_form", partial: "form", locals: { inventory: @inventory }) }
        format.html { render :new, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @inventory.update(inventory_params)
        format.turbo_stream
        format.html { redirect_to @inventory, notice: "Inventory item was successfully updated.", status: :see_other }
      else
        format.turbo_stream { render turbo_stream: turbo_stream.replace(dom_id(@inventory, :edit), partial: "edit_form", locals: { inventory: @inventory }) }
        format.html { render :edit, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @inventory.destroy!

    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to inventories_path, notice: "Inventory item was successfully destroyed.", status: :see_other }
    end
  end

  def search
    @inventories = Inventory.all
    @inventories = @inventories.where("LOWER(name) LIKE LOWER(?)", "%#{params[:q]}%") if params[:q].present?
    @inventories = @inventories.where("LOWER(code) LIKE LOWER(?)", "#{params[:code]}%") if params[:code].present?
    @inventories = @inventories.where(location: params[:location]) if params[:location].present?
    @inventories = @inventories.order(:code)
    @inventory = Inventory.new

    respond_to do |format|
      format.turbo_stream
      format.html { render :index }
    end
  end

  private

  def set_inventory
    @inventory = Inventory.find(params[:id])
  end

  def inventory_params
    params.require(:inventory).permit(:name, :code, :quantity, :unit, :location, :notes)
  end
end
