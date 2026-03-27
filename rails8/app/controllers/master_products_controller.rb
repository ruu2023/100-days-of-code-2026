class MasterProductsController < ApplicationController
  before_action :set_master_product, only: %i[edit update destroy row edit_row quick_update]

  def index
    @master_products = MasterProduct.search(params)
    @master_product = MasterProduct.new(status: "active", unit: "pcs", position: next_position)

    render partial: "table", locals: { master_products: @master_products } if turbo_frame_request?
  end

  def new
    @master_product = MasterProduct.new(status: "active", unit: "pcs", position: next_position)
  end

  def edit
  end

  def create
    @master_product = MasterProduct.new(master_product_params)

    respond_to do |format|
      if @master_product.save
        format.html { redirect_to master_demo_products_path, notice: "商品マスタを登録しました。" }
        format.turbo_stream
      else
        format.html { render :new, status: :unprocessable_entity }
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace(
            "master_product_form",
            partial: "form",
            locals: { master_product: @master_product }
          )
        end
      end
    end
  end

  def update
    if @master_product.update(master_product_params)
      redirect_to master_demo_products_path(anchor: helpers.dom_id(@master_product)), notice: "商品マスタを更新しました。"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @master_product.destroy!

    respond_to do |format|
      format.html { redirect_to master_demo_products_path, notice: "商品マスタを削除しました。" }
      format.turbo_stream
    end
  end

  def row
    render turbo_stream: turbo_stream.replace(
      helpers.dom_id(@master_product),
      partial: "master_product",
      locals: { master_product: @master_product }
    )
  end

  def edit_row
    render turbo_stream: turbo_stream.replace(
      helpers.dom_id(@master_product),
      partial: "row_form",
      locals: { master_product: @master_product }
    )
  end

  def quick_update
    if @master_product.update(quick_update_params)
      render turbo_stream: turbo_stream.replace(
        helpers.dom_id(@master_product),
        partial: "master_product",
        locals: { master_product: @master_product }
      )
    else
      render turbo_stream: turbo_stream.replace(
        helpers.dom_id(@master_product),
        partial: "row_form",
        locals: { master_product: @master_product }
      ), status: :unprocessable_entity
    end
  end

  private

  def set_master_product
    @master_product = MasterProduct.find(params[:id])
  end

  def master_product_params
    params.require(:master_product).permit(:sku, :name, :category, :supplier, :stock, :unit, :price, :status, :notes, :position)
  end

  def quick_update_params
    params.require(:master_product).permit(:stock, :price, :status, :notes)
  end

  def next_position
    MasterProduct.maximum(:position).to_i + 10
  end
end
