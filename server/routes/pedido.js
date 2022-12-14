const Joi = require('joi');
const md5 = require('../utils/md5-pass');
const knl = require('../knl');
const { Op } = require("sequelize")
const securityConsts = require('../consts/security-consts');
const { json } = require('sequelize');

knl.post('pedido', async(req, resp) => {
    const schema = Joi.object({
        dtEntrega : Joi.date().raw().required(),
        dtEmissao : Joi.date().raw().required(),
        total : Joi.number(),
        fkCliente: Joi.number().required(),
        fkEndereco: Joi.number().required(),
        
    proPedido       : Joi.array().items(Joi.object({
        description : Joi.string().min(1).max(200).required(),
        quantidade  : Joi.number().required(),
        acrescimo   : Joi.number().required(),
        vlUnitario :  Joi.number().required(),
        total : Joi.number().required(),
        fkProduto: Joi.number().required(),
        fkPedido: Joi.number().required()
            
        }))
    })

    knl.validate(req.body, schema);

    const result = await knl.sequelize().models.pedido.findAll({

    });

//     knl.createException('0006', '', !knl.objects.isEmptyArray(result));
//   ;

    const user = knl.sequelize().models.pedido.build({
        dtEmissao : req.body.dtEmissao,
        dtEntrega : req.body.dtEntrega,
        fkCliente : req.body.fkCliente,
        fkEndereco: req.body.fkEndereco,
        total: 50,
        status:0
    });

    await user.save();

    for (const proPedido of req.body.proPedido){
        const result2 = knl.sequelize().models.proPedido.build({
        fkProduto: proPedido.fkProduto,  
        vlUnitario: proPedido.vlUnitario,
        quantidade  : proPedido.quantidade,
        acrescimo   : proPedido.acrescimo,
        description : proPedido.description,
        fkPedido : proPedido.fkPedido,
        total: proPedido.total
        })
      await result2.save();     
    }
    
    resp.end()  
}, securityConsts.USER_TYPE_PUBLIC);

knl.get('pedido', async(req, resp) => {
    let result = await knl.sequelize().models.pedido.findAll({
        where : {
            status:1
            // id:{
            //     [Op.ne]:0

            //     }
            }
    });
    
    result = knl.objects.copy(result);

    if (!knl.objects.isEmptyArray(result)){
        for(let propedidos of result){
            const client = await knl.sequelize().models.clientes.findAll({
                where : {
                    id : propedidos.fkCliente
                }
            })

            if (!knl.objects.isEmptyArray(client)){
                propedidos.cliente_nomeFantasia = client[0].nomeFantasia
            }

            console.log( propedidos.cliente_nomeFantasia)
        }
    }
resp.send(result)


}, securityConsts.USER_TYPE_PUBLIC);
knl.get('pedido/:id', async(req, resp) => {
    const user = await knl.sequelize().models.proPedido.findAll({
        where: {
            fkCliente: req.params.id,
            where : {
                status:1
                // id:{
                //     [Op.ne]:0
                //     }
                }
        }
    });
    resp.send(user);
    resp.end();
}, securityConsts.USER_TYPE_PUBLIC);

knl.put('pedido', async(req, resp) => {
    const result = await knl.sequelize().models.pedido.update({
        dtEmissao : req.body.dtEmissao,
        dtEntrega : req.body.dtEntrega
    }, {
        where : {
        id : req.body.id
        }      
    });
    for (const pedi of req.body.pedi){
        const result2 = knl.sequelize().models.proPedido.update({
            description : proPedido.description,
            quantidade  : proPedido.quantidade,
            acrescimo   : proPedido.acrescimo,
        },{
            where : {
                id: pedi.id
            }
        })
    }
    
    resp.end();
});

knl.delete('pedido', async(req, resp) => {
        const result = await knl.sequelize().models.pedido.destroy({
            where : {
                id : req.body.id
            }
        });
        resp.send(result);
});

knl.patch('pedido', async(req, resp) => {
    const result = await knl.sequelize().models.pedido.update({
    status:0
    },{
         where : {
            id : req.body.id,
        }
    });
    resp.send("result")
});

