require "test_helper"

class Day083::DiaryEntryTest < ActiveSupport::TestCase
  test "requires body" do
    entry = Day083::DiaryEntry.new(entry_on: Date.current, mood: "happy")

    assert_not entry.valid?
    assert_includes entry.errors[:body], "can't be blank"
  end

  test "requires supported mood" do
    entry = Day083::DiaryEntry.new(entry_on: Date.current, body: "test", mood: "angry")

    assert_not entry.valid?
    assert_includes entry.errors[:mood], "is not included in the list"
  end
end
