class ItemsController < ApplicationController
  before_action :set_item, only: [:edit, :update, :destroy, :mark_purchased]

  def index
    @items = Item.active

    if params[:q].present?
      query = Item.sanitize_sql_like(params[:q])
      @items = @items.where("name LIKE ?", "%#{query}%")
    end

    @items = @items.to_a.sort_by(&:days_until_next_purchase)
  end


  def new
    @item = Item.new
  end

  def create
    @item = Item.new(item_params)

    if @item.save
      redirect_to items_path, notice: "登録しました！"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @item.update(item_params)
      redirect_to items_path, notice: "更新しました！"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @item.destroy!
    redirect_to items_path, notice: "削除しました！"
  end


  def mark_purchased
    @item.mark_as_purchased!

    @items = Item.active.to_a.sort_by(&:days_until_next_purchase)
    respond_to do |format|
      format.html { redirect_to items_path, notice: "更新しました！" }
      format.turbo_stream do
        flash.now[:notice] = "更新しました！"
      end
    end
  end


  private

  def set_item
    @item = Item.find(params[:id])
  end

  def item_params
    params.require(:item).permit(:name, :purchase_cycle_days, :last_purchased_on, :memo, :active)
  end
end
