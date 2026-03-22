class Day081::RouletteController < ApplicationController
  def index
    @roulette_data = Day081::RoulettePack.presets
  end
end
