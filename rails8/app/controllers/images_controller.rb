class ImagesController < ApplicationController
  def new
    @image = Image.new
  end

  def create
    @image = Image.new
    @image.file.attach(params[:image][:file])

    if @image.save
      render json: { id: @image.id, url: url_for(@image.file) }
    else
      render json: { error: @image.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    @image = Image.find(params[:id])
  end

  def download
    @image = Image.find(params[:id])

    width = params[:width].to_i
    height = params[:height].to_i
    crop_x = params[:crop_x].to_i
    crop_y = params[:crop_y].to_i
    crop_width = params[:crop_width].to_i
    crop_height = params[:crop_height].to_i
    format = params[:format] || "jpg"

    blob = @image.file.blob
    image_data = blob.download

    image = MiniMagick::Image.read(image_data)

    if crop_width > 0 && crop_height > 0
      image.combine_options do |cmd|
        cmd.crop "#{crop_width}x#{crop_height}+#{crop_x}+#{crop_y}!"
        cmd.resize "#{width}x#{height}"
      end
    else
      image.resize "#{width}x#{height}"
    end

    send_data image.to_blob,
              type: "image/#{format}",
              disposition: "attachment",
              filename: "resized_image.#{format}"
  end
end