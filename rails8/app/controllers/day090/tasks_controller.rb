module Day090
  class TasksController < ApplicationController
    # Skip authenticity token if using simple forms or just for ease of development?
    # No, Rails 8 typically uses Turbo and everything should be safe.
    
    def index
      @tasks = Task.today_focus
      @new_task = Task.new
    end

    def create
      @task = Task.new(task_params)
      if @task.save
        redirect_to day090_tasks_path, notice: "Task added for #{@task.scheduled_on}"
      else
        @tasks = Task.today_focus
        @new_task = @task
        render :index, status: :unprocessable_entity
      end
    end

    def update
      @task = Task.find(params[:id])
      if @task.update(completed_at: Time.current)
        redirect_to day090_tasks_path, notice: "Completed!"
      else
        redirect_to day090_tasks_path, alert: "Failed to update"
      end
    end

    private

    def task_params
      params.require(:day090_task).permit(:content)
    end
  end
end
