<div id="b2" class="jxgbox" style="width:500px; height:500px;"></div>
<script type="text/javascript">
    var board = JXG.JSXGraph.initBoard('b2', {boundingbox:[-2,10,5,-2], axis:true, showNavigation:true, showCopyright:false});
    
    var p1 = board.create('point',[1,4]);
    var l1 = board.create('line',[[0,0],p1],{straightFirst:false, straightLast:false, lastArrow:true});
    l1.setAttribute({fixed:true});
    var x = board.create('text',[-0.2, 0, '$x$'], {anchor: l1});
    var p2 = board.create('point',[4,5]);
    var l2 = board.create('line',[p1,p2],{straightFirst:false, straightLast:false, lastArrow:true});
    var y = board.create('text',[0, 0.5, '$y$'], {anchor: l2});
    var l3 = board.create('line',[[0,0],p2],{straightFirst:false, straightLast:false, lastArrow:true});
    l3.setAttribute({fixed:true});
    var text = board.create('text',[0.2, 0, 
    function(){
        return l3.L().toFixed(2);
    }], {anchor: l3});
</script>