require "open3"
require "tempfile"
require "timeout"
require "rbconfig"

class EditorsController < ApplicationController
  def index
    build_editor_state
  end

  def run
    build_editor_state(code: editor_params[:code])
    execute_ruby(@code)

    render :index, status: :ok
  end

  private

  def build_editor_state(code: default_code)
    @code = code
    @command = "ruby snippet.rb"
    @stdout = nil
    @stderr = nil
    @exit_status = nil
  end

  def execute_ruby(code)
    Tempfile.create([ "editor-snippet", ".rb" ]) do |file|
      file.write(code)
      file.flush

      command = [ RbConfig.ruby, file.path ]
      @command = command.join(" ")

      stdout, stderr, status = nil
      Timeout.timeout(4) do
        stdout, stderr, status = Open3.capture3(*command)
      end

      @stdout = stdout
      @stderr = stderr
      @exit_status = status.exitstatus
    end
  rescue Timeout::Error
    @stderr = "Execution timed out after 4 seconds."
    @exit_status = 124
  rescue StandardError => error
    @stderr = "#{error.class}: #{error.message}"
    @exit_status = 1
  end

  def editor_params
    params.expect(editor: [ :code ])
  end

  def default_code
    <<~RUBY
      # DO Query Ruby Editor
      records = [
        { name: "alpha", score: 12 },
        { name: "beta", score: 24 },
        { name: "gamma", score: 18 }
      ]

      top = records.max_by { |row| row[:score] }

      puts "top: #{top[:name]} (#{top[:score]})"
      puts "all: #{records.map { |row| row[:name] }.join(", ")}"
    RUBY
  end
end
