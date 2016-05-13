/* global $ */

$('#search').click(function () {
  $.get('/query', {
    before: $('#before').val(),
    after: $('#after').val()
  }).then(function (result) {
    if (result.length > 0) {
      $('#range').text(result[0].created + ' - ' + result[result.length - 1].created)
    }
    $('#result').empty()
    result.forEach(function (image) {
      var href = $('<a>').attr('href', '/media/' + image.uriPath)
        .attr('title', new Date(image.created).toString())
        .appendTo('#result')
      $('<img/>').attr('src', '/thumbs/200x200/' + image.uriPath).appendTo(href)
      console.log(image)
    })
  }).fail(function (err) {
    console.log(err)
  })
})
