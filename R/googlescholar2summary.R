#' Sync Google Scholar stats to the homepage Statistics section
#'
#' This function fetches Google Scholar profile summary data and recent yearly
#' citation history, then updates:
#' 1) `content/_index.md` (Statistics text + numbers)
#' 2) `static/data/scholar-stats.json` (frontend chart data)
#'
#' Notes:
#' - It depends on the CRAN packages `scholar` and `jsonlite`.
#' - `scholar::get_citation_history()` typically returns recent yearly citation
#'   history (Google Scholar chart window), not necessarily all years.
#'
#' @param scholar_id Google Scholar profile user ID.
#' @param index_file Path to homepage content file.
#' @param json_file Path to JSON file consumed by the frontend chart.
#' @param date_format Date format for the homepage text, default `%m/%d/%Y`.
#' @param verbose Whether to print progress messages.
#'
#' @return Invisibly returns a list with fetched stats and output file paths.
googlescholar2summary <- function(
  scholar_id = "3TK9yz8AAAAJ",
  index_file = "content/_index.md",
  json_file = "static/data/scholar-stats.json",
  date_format = "%m/%d/%Y",
  verbose = TRUE
) {
  require_namespace <- function(pkg) {
    if (!requireNamespace(pkg, quietly = TRUE)) {
      stop(sprintf("Package '%s' is required. Please install it first.", pkg), call. = FALSE)
    }
  }

  `%||%` <- function(x, y) {
    if (is.null(x) || (length(x) == 0)) y else x
  }

  log_msg <- function(...) {
    if (isTRUE(verbose)) message(...)
  }

  as_int_scalar <- function(x) {
    if (is.null(x) || length(x) == 0) return(NA_integer_)
    x <- x[[1]]
    if (is.na(x)) return(NA_integer_)
    as.integer(round(as.numeric(x)))
  }

  find_stats_block <- function(lines) {
    start_idx <- NA_integer_
    n <- length(lines)

    for (i in seq_len(n)) {
      if (grepl("^- block:\\s*features\\s*$", lines[i])) {
        look_ahead <- lines[seq.int(i, min(i + 8L, n))]
        if (any(grepl("^\\s+id:\\s*scholar-stats\\s*$", look_ahead))) {
          start_idx <- i
          break
        }
      }
    }

    if (is.na(start_idx)) {
      stop("Could not find the Statistics block (`id: scholar-stats`) in content/_index.md.", call. = FALSE)
    }

    next_blocks <- which(grepl("^- block:\\s*", lines))
    next_blocks <- next_blocks[next_blocks > start_idx]
    end_idx <- if (length(next_blocks)) next_blocks[1] - 1L else n
    list(start = start_idx, end = end_idx)
  }

  update_index_file <- function(path, publications, citations, h_index, updated_label) {
    lines <- readLines(path, warn = FALSE, encoding = "UTF-8")
    idx <- find_stats_block(lines)
    block <- lines[idx$start:idx$end]

    current_description <- NULL
    for (j in seq_along(block)) {
      line <- block[j]

      if (grepl("^\\s*text:\\s*", line)) {
        block[j] <- sprintf(
          "    text: Data from [Google Scholar](https://scholar.google.com/citations?hl=en&user=%s) (%s)",
          scholar_id,
          updated_label
        )
        next
      }

      desc_match <- regexec("^\\s*- description:\\s*(.+)\\s*$", line)
      desc <- regmatches(line, desc_match)[[1]]
      if (length(desc) > 1) {
        current_description <- trimws(desc[2])
        next
      }

      if (grepl("^\\s*name:\\s*", line) && !is.null(current_description)) {
        value <- switch(
          current_description,
          "Publications" = format(publications, big.mark = ",", scientific = FALSE, trim = TRUE),
          "Citations" = format(citations, big.mark = ",", scientific = FALSE, trim = TRUE),
          "H-index" = format(h_index, big.mark = ",", scientific = FALSE, trim = TRUE),
          NULL
        )
        if (!is.null(value)) {
          indent <- sub("^(\\s*)name:.*$", "\\1", line)
          block[j] <- sprintf("%sname: %s", indent, value)
        }
      }
    }

    lines[idx$start:idx$end] <- block
    writeLines(lines, path, useBytes = TRUE)
    invisible(path)
  }

  require_namespace("scholar")
  require_namespace("jsonlite")

  if (!file.exists(index_file)) {
    stop(sprintf("index_file not found: %s", index_file), call. = FALSE)
  }

  log_msg("Fetching Google Scholar profile: ", scholar_id)
  profile <- scholar::get_profile(scholar_id)
  publications_df <- scholar::get_publications(scholar_id)
  history_df <- scholar::get_citation_history(scholar_id)

  publications <- nrow(publications_df)
  citations <- as_int_scalar(profile$total_cites %||% profile$citedby %||% profile$total_citations)
  h_index <- as_int_scalar(profile$h_index %||% profile$hindex)

  if (is.na(citations)) {
    stop("Failed to parse total citations from `scholar::get_profile()` output.", call. = FALSE)
  }
  if (is.na(h_index)) {
    stop("Failed to parse h-index from `scholar::get_profile()` output.", call. = FALSE)
  }

  if (!is.data.frame(history_df) || nrow(history_df) == 0) {
    stop("`scholar::get_citation_history()` returned no data.", call. = FALSE)
  }

  year_col <- intersect(names(history_df), c("year", "Year"))
  cites_col <- intersect(names(history_df), c("cites", "citations", "Citations"))
  if (length(year_col) == 0 || length(cites_col) == 0) {
    stop("Unexpected columns in citation history data.", call. = FALSE)
  }

  citation_history <- data.frame(
    year = as.integer(history_df[[year_col[1]]]),
    citations = as.integer(history_df[[cites_col[1]]]),
    stringsAsFactors = FALSE
  )
  citation_history <- citation_history[stats::complete.cases(citation_history), , drop = FALSE]
  citation_history <- citation_history[order(citation_history$year), , drop = FALSE]
  citation_history_list <- lapply(seq_len(nrow(citation_history)), function(i) {
    list(
      year = unname(citation_history$year[[i]]),
      citations = unname(citation_history$citations[[i]])
    )
  })

  updated_date <- Sys.Date()
  updated_label <- format(updated_date, date_format)

  json_payload <- list(
    source = "Google Scholar",
    profile_id = scholar_id,
    updated = as.character(updated_date),
    updated_label = updated_label,
    publications = publications,
    citations = citations,
    h_index = h_index,
    citations_by_year = citation_history_list
  )

  dir.create(dirname(json_file), recursive = TRUE, showWarnings = FALSE)
  jsonlite::write_json(
    x = json_payload,
    path = json_file,
    auto_unbox = TRUE,
    pretty = TRUE,
    null = "null"
  )
  log_msg("Wrote JSON: ", json_file)

  update_index_file(
    path = index_file,
    publications = publications,
    citations = citations,
    h_index = h_index,
    updated_label = updated_label
  )
  log_msg("Updated homepage content: ", index_file)

  log_msg(
    "Done. publications=", publications,
    ", citations=", citations,
    ", h-index=", h_index,
    ". citation years=", nrow(citation_history)
  )

  invisible(list(
    scholar_id = scholar_id,
    publications = publications,
    citations = citations,
    h_index = h_index,
    citations_by_year = citation_history,
    index_file = index_file,
    json_file = json_file
  ))
}
