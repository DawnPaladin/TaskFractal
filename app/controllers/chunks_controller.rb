class ChunksController < ApplicationController
  before_action :set_chunk, only: [:show, :update, :destroy]

  # GET /chunks
  def index
    @chunks = Chunk.all

    render json: @chunks
  end

  # GET /chunks/1
  def show
    render json: @chunk
  end

  # POST /chunks
  def create
    @chunk = Chunk.new(chunk_params)

    if @chunk.save
      render json: @chunk, status: :created, location: @chunk
    else
      render json: @chunk.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /chunks/1
  def update
    if @chunk.update(chunk_params)
      render json: @chunk
    else
      render json: @chunk.errors, status: :unprocessable_entity
    end
  end

  # DELETE /chunks/1
  def destroy
    @chunk.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_chunk
      @chunk = Chunk.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def chunk_params
      params.require(:chunk).permit(:name, :completed)
    end
end
