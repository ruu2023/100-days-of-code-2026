class Mouse < ApplicationRecord
  enum :status, { todo: 0, doing: 1, done: 2 }
end
