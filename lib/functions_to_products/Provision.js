"use strict";

let Modules = {
	fs: require('fs')
};

class MMProvision {
	constructor(storeCode) {
		this.storeCode = storeCode;
		this.xml = '';
	}

	build() {
		if (this.storeCode !== undefined) {
			return `<Provision><Store code="${ this.storeCode }">${ this.xml }</Store></Provision>`;
		}
		else {
			return this.xml;
		}
	}

	/* Tag Methods */
	Product_Add(Code, SKU, Name, Price, Cost, Weight, Description, Taxable, Active, CanonicalCategoryCode, AlternateDisplayPage, ThumbnailImage, FullSizeImage) {
		this.xml += `<Product_Add>
			<Code>${ Code }</Code>
			<SKU>${ SKU }</SKU>
			<Name><![CDATA[${ Name }]]></Name>
			<Price>${ Price }</Price>
			<Cost>${ Cost }</Cost>
			<Weight>${ Weight }</Weight>
			<Description><![CDATA[${ Description }]]></Description>
			<Taxable>${ Taxable }</Taxable>
			<Active>${ Active }</Active>
			<CanonicalCategoryCode>${ CanonicalCategoryCode }</CanonicalCategoryCode>
			<AlternateDisplayPage>${ AlternateDisplayPage }</AlternateDisplayPage>
			<ThumbnailImage>${ ThumbnailImage }</ThumbnailImage>
			<FullSizeImage>${ FullSizeImage }</FullSizeImage>
		</Product_Add>`;
	}
	ProductAttribute_Add(product_code, Code, Type, Prompt, Image, Price, Cost, Weight, Required) {
		this.xml += `<ProductAttribute_Add product_code="${ product_code }">
			<Code>${ Code }</Code>
			<Type>${ Type }</Type>
			<Prompt><![CDATA[${ Prompt }]]></Prompt>
			<Image>${ Image }</Image>
			<Price>${ Price }</Price>
			<Cost>${ Cost }</Cost>
			<Weight>${ Weight }</Weight>
			<Required>${ Required }</Required>
		</ProductAttribute_Add>`;
	}
	ProductAttributeOption_Add(product_code, attribute_code, Code, Prompt, Image, Price, Cost, Weight, DefaultOption) {
		this.xml += `<ProductAttributeOption_Add product_code="${ product_code }" attribute_code="${ attribute_code }">
			<Code>${ Code }</Code>
			<Prompt><![CDATA[${ Prompt }]]></Prompt>
			<Image>${ Image }</Image>
			<Price>${ Price }</Price>
			<Cost>${ Cost }</Cost>
			<Weight>${ Weight }</Weight>
			<DefaultOption>${ DefaultOption }</DefaultOption>
		</ProductAttributeOption_Add>`;
	}
	
	
	Customfields__ProductField_Value(product_code, field_code, value) {
		this.xml += `<Module code="customfields" feature="fields_prod">
			<ProductField_Value product="${ product_code }" field="${ field_code }"><![CDATA[${ value }]]></ProductField_Value>
		</Module>`;
	}

}

class Util {
	constructor() {}

	static truncate(string, length) {
		return string.substring(0, length);
	}
	static generateTag(file, fn) {
		return `<mvt:do file="${ file.distro_path }" name="l.success" value="${ fn.name }(${ fn.parameters.join(', ') })" />`
	}
}




// new instance of mmp
let mmp = new MMProvision('123');


// Handle file
let files = JSON.parse( Modules.fs.readFileSync('mv-lsk.json', 'utf8') );
for (let file of files) {
	for (let fn of file.functions) {

		var product_code = Util.truncate( fn.name, 50 );

		mmp.Product_Add(
			product_code,
			'',
			fn.name,
			0,
			0,
			0,
			'',
			0,
			1,
			'',
			'function_reference',
			'',
			''
		);
		mmp.Customfields__ProductField_Value(product_code, 'f_generated_tag', Util.generateTag(file, fn));
		mmp.ProductAttribute_Add(
			product_code,
			'parameters',
			'select',
			'Parameters',
			'',
			0,
			0,
			0,
			'Yes'
		);
		for (let parameter of fn.parameters) {
			mmp.ProductAttributeOption_Add(
				product_code,
				'parameters',
				String.fromCharCode( fn.parameters.indexOf(parameter) + 65 ),
				parameter,
				'',
				0,
				0,
				0,
				'Yes'
			);
		}

	}
}

console.log( mmp.build() );