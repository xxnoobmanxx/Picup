
;(function($){

    var instancesIdx = 0;
    var instances = [];

    //parametros default
    var sDefaults = {
        buttonText: 'Selecionar Fotos',
        addFunction: function contentImg(img, complement){
            return '<span style="display: block; background: url('+img+') center center no-repeat; background-size: cover; height: 80px; width: 80px" /></span>';
        },
        deleteImg: function (content) {
            $(content).hide();
        },
        messageReturn: function(message, nivel, data){
            return message;
        },
        deleteClass: "",
        messageClass: "",
        deleteButtonClass: "",
        contentClass: "",
        blockClass: "",
        maxSize: 4,
        content: null
    };

    var picupConstructor = function (context, opt) {
        opt = opt || {};

        instancesIdx++;
        instances[instancesIdx] = this;
        //var opt = $.extend(sDefaults, parametros);
        $(context).data('picupIndex', instancesIdx);

        /**
         * determina o valor de uma opção
         * @param optIndex
         * @param _opt
         */
        this.setOpt = function (optIndex, _opt) {
            opt[optIndex] = _opt;
            this.refresh();
        };

        this.refresh = function () {
            var $context = $(context);
            $context.html('');
            construct.apply($context, []);
        };

        function construct() {

            $(this).closest('form').attr({'enctype': 'multipart/form-data'});
            $(this).addClass('pic-up-imagens');

            if(opt.name == undefined) {
                $(this).html('pic-up: error');
                console.error('Atributo name não foi definido ao pic-up');
                return false;
            }

            var inputFile = '<input type="file" name="picup-files['+opt.name+'][]" multiple="true" style="display: none;" accept="image/*" data-active="true"/>';
            var html = $('<div class="picup-block '+opt.blockClass+'"><div class="picup-button"><button type="button">'+opt.buttonText+'</button></div><div class="picup-uplods"></div></div>');

            $(this).html(html);

            $(html).find('>.picup-button button').click(function(){
                if($(html).find('input[type="file"][data-active="true"]').length == 0)
                    $(this).before(inputFile);

                $(html).find('input[type="file"][data-active="true"]').click();
            });

            /** carregamento do conteudo já existente **/
            if(opt.content != null){
                for(var vlr in opt.content){
                    if(opt.content[vlr].id == undefined) {
                        console.error('Campo de id no content não foi encontrado');
                        continue;
                    }

                    (function(){
                        var content = $('<div class="picup-content ' + opt.contentClass + '"></div>');
                        content.append(opt.addFunction(opt.content[vlr].img, opt.content[vlr]));

                        var inputDelete = $('<input type="text" value="0" name="picup-delete-content['+opt.name+']['+opt.content[vlr].id+']" style="display: none;"/>');
                        var buttonDelete = $('<button>', {type: 'button', class: opt.deleteButtonClass}).text('Apagar').click(function(){
                            $(inputDelete).val('1');
                            opt.deleteImg(content);
                        });

                        $(content).append('<div class="picup-delete ' + opt.deleteClass + '"></div>');
                        $(content).find('.picup-delete').append([inputDelete, buttonDelete]);

                        $(html).find('.picup-uplods').append(content);
                    })()
                }

            }

            var idx = 0;

            $(html).on('change', 'input[type="file"][data-active="true"]', function(event){
                $(this).attr({'data-active': false});

                $.each(this.files, function(index, file){
                    if(file.type.match('image.*')){

                        (function(idx){
                            var reader = new FileReader();

                            reader.onload = function(f){
                                var returnMessage = "";
                                var content = $('<div class="picup-content ' + opt.contentClass + '"></div>').attr({'data-idx': 'pc_'+idx});
                                var size = ((f.total/1024)/1024); // em MB
                                size = parseFloat(size.toFixed(3));

                                content.append(opt.addFunction(f.target.result, {id: 'pc_'+idx}));

                                var inputDelete = $('<input type="text" value="0" name="picup-delete['+opt.name+']['+'pc_'+idx+']" style="display: none;"/>');
                                var buttonDelete = $('<button>', {type: 'button', class: opt.deleteButtonClass}).text('Apagar').click(function(){
                                    $(inputDelete).val('1');
                                    opt.deleteImg(content);
                                });

                                if(size > opt.maxSize){
                                    $(inputDelete).val('1');
                                    returnMessage = opt.messageReturn("A imagem não pode ultrapassar "+opt.maxSize+"MB. Reduza a imagem e tente novamente.", "1", {"size": size})
                                }

                                if(returnMessage != '') {
                                    $(content).append('<div class="picup-message ' + opt.messageClass + '"></div>');
                                    $(content).find('.picup-message').append(returnMessage);
                                }

                                $(content).append('<div class="picup-delete ' + opt.deleteClass + '"></div>');
                                $(content).find('.picup-delete').append([inputDelete, buttonDelete]);

                                $(html).find('.picup-uplods').append(content);
                            };

                            reader.readAsDataURL(file);
                        })(idx++)


                    }
                });
            });
        }
        construct.apply($(context), []);
    };

    $.fn.extend({
        picup: function () {

            var args = arguments;
            var opt = $.extend({}, sDefaults, args[0]);

            return this.each(function(){

                var $context = $(this);

                if (args.length == 1) {
                    new picupConstructor($context, opt);
                } else if (args.length == 2) {
                    if ($context.is('.pic-up-imagens')) {
                        instances[$context.data('picupIndex')].setOpt(args[0], args[1]);
                    }
                } else if (args.length == 0) {
                    if ($context.is('.pic-up-imagens')) {
                        instances[$context.data('picupIndex')].refresh();
                    }
                }

            });
        }
    });

})(jQuery);
