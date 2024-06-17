<div id="b7" class="jxgbox" style="width:500px; height:500px;"></div>
<script type="text/javascript">

    var board = JXG.JSXGraph.initBoard('b7', {boundingbox:[-5,10,10,-5], axis:true, showNavigation:true, showCopyright:false});
    
    var length = 2;
    
    var a = board.create('slider',[[-4,-1],[4,-1],[-4,0,8]],{name:'x'});
    var b = board.create('slider',[[-4,-2],[4,-2],[-4,0,8]],{name:'y'});
    var theta = board.create('slider',[[-4,-3],[4,-3],[-2*Math.PI,0,2*Math.PI]],{name:'theta'});
    var scale = board.create('slider',[[-4,-4],[4,-4],[0.1,1,3]],{name:'scale'});
    
    var sq = [],
        right = board.create('transform', [
        function() {return length * scale.Value() ;}, 0], {type: 'translate'}),
        up = board.create('transform', [0, 
        function() {return length * scale.Value() ;}], {type: 'translate'}),
        pol, rot, p0;

    sq[0] = board.create('point', [
    function() {return a.Value();}, 
    function() {return b.Value();}]),

    // Construct the other free points by transformations
    sq[1] = board.create('point', [sq[0], right], {visible: false}),
    sq[2] = board.create('point', [sq[0], [right, up]], {visible: false}),
    sq[3] = board.create('point', [sq[0], up], {visible: false}),

    // Polygon through these four points
    pol = board.create('polygon', sq);
    
    var _p = board.create('point', [sq[0], right],{visible: false});

    // Rotate the square around point sq[0]
    rot = board.create('transform', [
        function() {return theta.Value();}, sq[0]], {type: 'rotate'});

    // Apply the rotation to all but the first point of the square
    rot.bindTo(sq.slice(1));
    
    var va = board.create('line',[[0,0],sq[0]],{straightFirst:false, straightLast:false, lastArrow:true});
    var angle = board.create('angle', [_p, sq[0], sq[1]], {name: 'theta', radius: length });

</script>