function submit() {
	draw_graph();

	// set URL Parameters
	var directed = $("#directed").prop('checked')?'1':'0';
	var ignore = $("#ignore").prop('checked')?'1':'0';
	var ignore_mul_edge = $("#ignore_mul_edge").prop('checked')?'1':'0';
	var data = $("#data").val();
	var url = location.pathname+"?"+"data="+encodeURIComponent(data).replace(/%20/g,'+')+"&directed="+directed+"&ignore="+ignore+"&ignore_mul_edge="+ignore_mul_edge;
	window.history.replaceState("","",url);
}

function check_edge(multiple_edges,start,end){
	if (multiple_edges[start][end] !== undefined) return 2;
	if (multiple_edges[end][start] !== undefined) return 1;
	return 0;
}

function draw_graph() {
	var directed = $("#directed").prop('checked');
	var ignore = $("#ignore").prop('checked');
	var ignore_mul_edge = $("#ignore_mul_edge").prop('checked');

	var data = $("#data").val();
	data = data.split('\n');
	if (ignore && data.length >= 1) {
		data[0] = "";
	}
	for (var i in data) {
		data[i] = data[i].trim().split(/ +/);
		if (data[i].length >= 2) {
			data[i][0] = data[i][0];
			data[i][1] = data[i][1];
		}
	}

	//create nodes
	var nodes_set = new Set();
	for (var i in data) {
		if (data[i].length < 2) continue;
		nodes_set.add(data[i][0]);
		nodes_set.add(data[i][1]);
	}
	var nodes = [];
	var multiple_edges = [];
	for (var node of nodes_set) {
		nodes.push({id: node, label: node});
		multiple_edges[node] = [];
	}

	// create edges
	var edges = [];
	for (var i in data) {
		if (data[i].length < 2) continue;
		if (ignore_mul_edge) {
			if (directed && check_edge(multiple_edges,data[i][0],data[i][1]) >= 2) continue;
			else if (!directed && check_edge(multiple_edges,data[i][0],data[i][1]) >= 1) continue;
		}
		var edge = {from: data[i][0], to: data[i][1]};
		if (data[i].length >= 3) {
			edge.label = data[i][2];
		}
		if (directed) {
			edge.arrows = 'to';
		} else {
			multiple_edges[data[i][1]][data[i][0]] = true;
		}
		multiple_edges[data[i][0]][data[i][1]] = true;
		edges.push(edge);
	}

	// create a network
	var container = document.getElementById('graph');
	var data = {
		nodes: new vis.DataSet(nodes),
		edges: new vis.DataSet(edges)
	};
	var options = {};
	var network = new vis.Network(container, data, options);
}

$(document).ready(function() {
	// load URL Parameters
	if (getUrlParameter("ignore")) {
		$("#ignore").prop('checked',getUrlParameter("ignore")=="1");
	}
	if (getUrlParameter("directed")) {
		$("#directed").prop('checked',getUrlParameter("directed")=="1");
	}
	if (getUrlParameter("data")) {
		$("#data").val(getUrlParameter("data"));
		draw_graph();
	}

	// Ctrl + Enter
	$("#data").keydown(function(e) {
		if (e.ctrlKey && e.keyCode == 13) {
			submit();
		}
	});
});

var getUrlParameter = function getUrlParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1).replace(/\+/g, '%20'));
	var sURLVariables = sPageURL.split('&');

	for (var i = 0; i < sURLVariables.length; i++) {
		var sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};
