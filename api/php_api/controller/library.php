<?php
	/*here you can get file from database */
	echo json_encode(
		array(
			"img_arr" => array(
				array(
					"ID" => 1,
					"src" => "http://fl.local:8081/images/Chrysanthemum.jpg",
					"thumb" => "http://fl.local:8081/images/Chrysanthemum-150x200.jpg",
					"alt" => "Chrysanthemum",
					"width" => 500,
					"height" => 375
				),
				array(
					"ID" => 2,
					"src" => "http://fl.local:8081/images/Remax Bay Street logo.jpg",
					"thumb" => "http://fl.local:8081/images/Remax Bay Street logo-150x200.jpg",
					"alt" => "Remax Bay Street",
					"width" => 500,
					"height" => 221
				)
			),
			"pagination" => "<nav aria-label='Page navigation'><ul class='pagination'><li><a href='#' aria-label='Previous'><span aria-hidden='true'>&laquo;</span></a></li><li><a href='#'>1</a></li><li><a href='#'>2</a></li><li><a href='#'>3</a></li><li><a href='#'>4</a></li><li><a href='#'>5</a></li><li><a href='#' aria-label='Next'><span aria-hidden='true'>&raquo;</span></a></li></ul></nav>"
		)
	);
?>