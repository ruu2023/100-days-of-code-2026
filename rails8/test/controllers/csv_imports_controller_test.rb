require "test_helper"

class CsvImportsControllerTest < ActionDispatch::IntegrationTest
  include ActionDispatch::TestProcess::FixtureFile

  teardown do
    CsvImport.find_each do |csv_import|
      next unless ActiveRecord::Base.connection.data_source_exists?(csv_import.target_table_name)

      ActiveRecord::Base.connection.drop_table(csv_import.target_table_name)
    end
  end

  test "should get index" do
    get csv_imports_url

    assert_response :success
  end

  test "should create csv import and analyze schema" do
    assert_difference("CsvImport.count") do
      post csv_imports_url, params: {
        csv_import: {
          name: "顧客一覧",
          source_file: fixture_file_upload("customers.csv", "text/csv")
        }
      }
    end

    csv_import = CsvImport.order(:created_at).last

    assert_redirected_to csv_import_url(csv_import)
    assert_equal "uploaded", csv_import.status
    assert_equal 3, csv_import.row_count
    assert_equal ["customer_code", "name", "city"], csv_import.column_names_for_search
  end

  test "should import csv and search rows" do
    post csv_imports_url, params: {
        csv_import: {
          name: "顧客検索",
          source_file: fixture_file_upload("customers.csv", "text/csv")
        }
      }

    csv_import = CsvImport.order(:created_at).last

    post run_import_csv_import_url(csv_import)

    assert_redirected_to csv_import_url(csv_import)
    assert_predicate csv_import.reload, :ready?
    assert ActiveRecord::Base.connection.data_source_exists?(csv_import.target_table_name)

    get csv_import_url(csv_import), params: { q: "Tokyo" }

    assert_response :success
    assert_includes @response.body, "Alice"
    assert_includes @response.body, "Tokyo"
  end
end
