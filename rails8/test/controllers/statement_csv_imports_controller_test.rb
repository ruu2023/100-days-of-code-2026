require "test_helper"

class StatementCsvImportsControllerTest < ActionDispatch::IntegrationTest
  include ActionDispatch::TestProcess::FixtureFile

  teardown do
    StatementCsvImportDataset.distinct.pluck(:target_table_name).each do |table_name|
      next unless ActiveRecord::Base.connection.data_source_exists?(table_name)

      ActiveRecord::Base.connection.drop_table(table_name)
    end
  end

  test "should get index" do
    get statement_csv_imports_url

    assert_response :success
    assert_includes @response.body, 'enctype="multipart/form-data"'
  end

  test "should analyze multiple files into grouped datasets" do
    assert_difference("StatementCsvImport.count", 1) do
      assert_difference("StatementCsvImportFile.count", 3) do
        assert_difference("StatementCsvImportDataset.count", 2) do
      post statement_csv_imports_url, params: {
        statement_csv_import: {
          name: "カード明細まとめ",
          source_files: [
            fixture_file_upload("statement_month_01.csv", "text/csv"),
            fixture_file_upload("statement_month_02.csv", "text/csv"),
            fixture_file_upload("statement_other_card.csv", "text/csv")
          ]
        }
      }
        end
      end
    end

    statement_csv_import = StatementCsvImport.order(:created_at).last
    grouped_dataset = statement_csv_import.statement_csv_import_datasets.find_by(header_signature: "date|merchant|amount")

    assert_redirected_to statement_csv_import_url(statement_csv_import)
    assert_equal "uploaded", statement_csv_import.status
    assert_equal 2, grouped_dataset.statement_csv_import_files.count
    assert_equal 4, grouped_dataset.row_count
    assert_equal ["date", "merchant", "amount"], grouped_dataset.column_names_for_search
  end

  test "should import grouped dataset and search rows" do
    post statement_csv_imports_url, params: {
      statement_csv_import: {
        name: "カード明細検索",
        source_files: [
          fixture_file_upload("statement_month_01.csv", "text/csv"),
          fixture_file_upload("statement_month_02.csv", "text/csv")
        ]
      }
    }

    statement_csv_import = StatementCsvImport.order(:created_at).last
    dataset = statement_csv_import.statement_csv_import_datasets.order(:created_at).first

    post run_import_statement_csv_import_url(statement_csv_import)

    assert_redirected_to statement_csv_import_url(statement_csv_import)
    assert_predicate statement_csv_import.reload, :ready?
    assert_predicate dataset.reload, :ready?
    assert ActiveRecord::Base.connection.data_source_exists?(dataset.target_table_name)

    get statement_csv_import_dataset_url(dataset), params: {
      search: {
        keyword: "Coffee",
        order_by: "date",
        direction: "asc",
        limit: "20",
        filters: [
          { column: "", operator: "", value: "" },
          { column: "", operator: "", value: "" },
          { column: "", operator: "", value: "" }
        ]
      }
    }

    assert_response :success
    assert_includes @response.body, "Coffee"
    assert_includes @response.body, "2026-02-02"
    assert_includes @response.body, "ORDER BY &quot;date&quot; ASC"
  end

  test "should update dataset display names before import" do
    post statement_csv_imports_url, params: {
      statement_csv_import: {
        name: "表示名編集",
        source_files: [fixture_file_upload("statement_other_card.csv", "text/csv")]
      }
    }

    statement_csv_import = StatementCsvImport.order(:created_at).last
    dataset = statement_csv_import.statement_csv_import_datasets.first

    patch statement_csv_import_dataset_url(dataset), params: {
      display_names: {
        "used_on" => "利用日",
        "shop_name" => "店舗名",
        "total" => "利用金額"
      }
    }

    assert_redirected_to statement_csv_import_url(statement_csv_import)
    assert_equal "利用日", dataset.reload.display_name_for("used_on")

    get statement_csv_import_url(statement_csv_import)

    assert_response :success
    assert_includes @response.body, "利用日"
    assert_includes @response.body, "店舗名"
  end

  test "should append to an existing grouped table when header matches" do
    post statement_csv_imports_url, params: {
      statement_csv_import: {
        name: "1回目",
        source_files: [fixture_file_upload("statement_month_01.csv", "text/csv")]
      }
    }

    first_import = StatementCsvImport.order(:created_at).last
    first_dataset = first_import.statement_csv_import_datasets.first

    post run_import_statement_csv_import_url(first_import)

    post statement_csv_imports_url, params: {
      statement_csv_import: {
        name: "2回目",
        source_files: [fixture_file_upload("statement_month_02.csv", "text/csv")]
      }
    }

    second_import = StatementCsvImport.order(:created_at).last
    second_dataset = second_import.statement_csv_import_datasets.first

    assert_equal StatementCsvImportDataset::APPEND_TABLE, second_dataset.target_mode
    assert_equal first_dataset.target_table_name, second_dataset.target_table_name

    post run_import_statement_csv_import_url(second_import)

    record_class = second_dataset.reload.dynamic_record_class

    assert_equal 4, record_class.count
  end
end
