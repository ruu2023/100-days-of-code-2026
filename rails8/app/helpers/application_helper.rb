module ApplicationHelper
  def generate_markdown(parsed)
    return "" unless parsed

    headers = parsed[:headers]
    rows = parsed[:rows]

    # Calculate max width for each column
    col_widths = headers.map.with_index do |_, i|
      max = headers[i].to_s.length
      rows.each { |row| max = [max, row[i].to_s.length].max }
      max
    end

    lines = []
    # Header row
    lines << "| #{headers.map.with_index { |h, i| h.to_s.ljust(col_widths[i]) }.join(' | ')} |"
    # Separator row
    lines << "| #{col_widths.map { |w| '-' * w }.join(' | ')} |"
    # Data rows
    rows.each do |row|
      lines << "| #{row.map.with_index { |cell, i| cell.to_s.ljust(col_widths[i]) }.join(' | ')} |"
    end
    lines.join("\n")
  end
end
