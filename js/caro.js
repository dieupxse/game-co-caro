var size = 15;
var currentValue = 'O';
var currenPlayer = 1;
var end = false;
$(function() {
	var banco = $('#banco');
	var sizeOco = banco.width()/size;
	banco.html('');	
	var html="";
	for(var i=1;i<=size;i++) {
		for(var j=1;j<=size;j++) {
			html+="<div class='oco' id='o_"+i+"_"+j+"' data-row='"+i+"' data-col='"+j+"' data-value=''></div><!---->";
		}
		html+="<div class='clearfix'></div>";
	}
	banco.append(html);
	ocoClick();
});

function ocoClick() {
	$('.oco').on('click',function() {
		if($(this).attr('data-value')!=='' && $(this).text()!=='') return false;
		if(window.end) return false;
		var row = $(this).attr('data-row');
		var col = $(this).attr('data-col');
		$(this).attr('data-value',window.currentValue);
		$(this).text(window.currentValue);
		kiemTrathang(row,col);
		switchValue();
	});
}

function switchValue() {
	if(window.currentValue==='O') {
		window.currentValue='X';
		window.currenPlayer = 2;
	} else {
		window.currentValue = 'O';
		window.currenPlayer = 1;
	}
}

function kiemTrathang(i, j){
		var ketqua=false;
		var dem1, dem2;
		var k;
		var l;
		
		//kiem tra neu thang theo hang
		dem1 = -1;
		k=j;
		while($('#o_'+i+'_'+k).attr('data-value') === $('#o_'+i+'_'+j).attr('data-value')){
			dem1++;
			k--;
		}

		dem2 = -1;
		k=j;
		while($('#o_'+i+'_'+k).attr('data-value') === $('#o_'+i+'_'+j).attr('data-value')){
			dem2++;
			k++;
		}
		if(dem1+dem2+1>=5){
			alert($('#o_'+i+'_'+j).attr('data-value')+ 'da thang !');
			window.end = true;
			//hien thi hang chien thang
			k=j;
			while($('#o_'+i+'_'+k).attr('data-value') === $('#o_'+i+'_'+j).attr('data-value')){
				$('#o_'+i+'_'+k).css({color: red});
				k--;
			}

			k=j;
			while($('#o_'+i+'_'+k).attr('data-value') === $('#o_'+i+'_'+j).attr('data-value')){
				$('#o_'+i+'_'+k).css({color: red});
				k++;
			}
		}

		//Truong hop thang cot
		dem1 = -1;
		k=i;
		while($('#o_'+k+'_'+j).attr('data-value') === $('#o_'+i+'_'+j).attr('data-value')){
			dem1++;
			k--;
		}

		dem2 = -1;
		k=i;
		while($('#o_'+k+'_'+j).attr('data-value') === $('#o_'+i+'_'+j).attr('data-value')){
			dem2++;
			k++;
		}
		//check if thang theo cot
		if(dem1+dem2+1>=5){
			
			alert($('#o_'+i+'_'+j).attr('data-value')+ 'da thang !');
			window.end = true;
			//highlight win row
			k=i;
			while($('#o_'+k+'_'+j).attr('data-value') === $('#o_'+i+'_'+j).attr('data-value')){
				$('#o_'+k+'_'+j).css({color: red});
				k--;
			}

			k=i;
			while($('#o_'+k+'_'+j).attr('data-value') === $('#o_'+i+'_'+j).attr('data-value')){
				$('#o_'+k+'_'+j).css({color: red});
				k++;
			} 
		}
		//Truong hop cheo  chinh
		dem1 = -1;
		k=i;
		l=j;
		while($('#o_'+i+'_'+j).attr('data-value') === $('#o_'+k+'_'+l).attr('data-value')){
			dem1++;
			k--;
			l--;
		}

		dem2 = -1;
		k=i;
		l=j;
		while($('#o_'+i+'_'+j).attr('data-value') === $('#o_'+k+'_'+l).attr('data-value')){
			dem2++;
			k++;
			l++;
		}
		if(dem1+dem2+1>=5){
			alert($('#o_'+i+'_'+j).attr('data-value')+ 'da thang !');
			window.end = true;
			//highlight hang duong chien thang
			k=i;
			l=j;
			while($('#o_'+k+'_'+l).attr('data-value') === $('#o_'+i+'_'+j).attr('data-value')){
				$('#o_'+k+'_'+l).css({color: red});
				k--;
				l--;
			}

			k=i;
			l=j;
			while($('#o_'+k+'_'+l).attr('data-value') === $('#o_'+i+'_'+j).attr('data-value')){
				$('#o_'+k+'_'+l).css({color: red});
				k++;
				l++;
			}
		}
		//Truong hop cheo phu 
		dem1 = -1;
		k=i;
		l=j;
		while($('#o_'+i+'_'+j).attr('data-value') === $('#o_'+k+'_'+l).attr('data-value')){
			dem1++;
			k--;
			l++;
		}

		dem2 = -1;
		k=i;
		l=j;
		while($('#o_'+i+'_'+j).attr('data-value') === $('#o_'+k+'_'+l).attr('data-value')){
			dem2++;
			k++;
			l--;
		}
		if(dem1+dem2+1>=5){
			alert($('#o_'+i+'_'+j).attr('data-value')+ 'da thang !');
			window.end = true;
			//highligt
			k=i;
			l=j;
			while($('#o_'+k+'_'+l).attr('data-value') === $('#o_'+i+'_'+j).attr('data-value')){
				$('#o_'+k+'_'+l).css({color: red});
				k--;
				l++;
			}

			k=i;
			l=j;
			while($('#o_'+k+'_'+l).attr('data-value') === $('#o_'+i+'_'+j).attr('data-value')){
				$('#o_'+k+'_'+l).css({color: red});
				k++;
				l--;
			}
		}
		return ketqua;
	}
