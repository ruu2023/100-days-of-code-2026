# frozen_string_literal: true

class PartiesController < ApplicationController
  before_action :set_party, only: [:show, :edit, :update, :destroy]

  # Search parties for autocomplete
  def search
    @parties = Party.active.search(params[:query])
                    .by_type(params[:type])
                    .limit(10)

    render partial: "search_results"
  end

  # Quick create a new party from autocomplete
  def quick_create
    @party = Party.new(party_params)

    if @party.save
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("quick_add_party", partial: "quick_created", locals: { party: @party }) }
        format.json { render json: @party, status: :created }
      end
    else
      respond_to do |format|
        format.turbo_stream
        format.json { render json: @party.errors, status: :unprocessable_entity }
      end
    end
  end

  # Show quick new form in turbo frame
  def quick_new
    @party = Party.new(
      name: params[:name],
      party_type: params[:party_type] || "client"
    )
    render partial: "quick_new"
  end

  # Traditional CRUD actions
  def index
    @parties = Party.active.order(:name)
  end

  def show; end

  def new
    @party = Party.new
  end

  def edit; end

  def create
    @party = Party.new(party_params)

    if @party.save
      redirect_to [:accounting, @party], notice: "Party was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @party.update(party_params)
      redirect_to [:accounting, @party], notice: "Party was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @party.update!(active: false)
    redirect_to accounting_parties_url, notice: "Party was successfully deactivated."
  end

  private

  def set_party
    @party = Party.find(params[:id])
  end

  def party_params
    params.require(:party).permit(:name, :party_type, :email, :phone, :address, :tax_id)
  end
end
