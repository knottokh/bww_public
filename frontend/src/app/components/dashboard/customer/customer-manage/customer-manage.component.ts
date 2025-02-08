import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RouterPath, User } from 'src/app/_models';
import { AuthenticationService, CustomerService, ShippingService, PaymentService } from 'src/app/_services';

@Component({
  selector: 'app-customer-manage',
  templateUrl: './customer-manage.component.html',
  styleUrls: ['./customer-manage.component.scss']
})
export class CustomerManageComponent implements OnInit {

  modalRef: BsModalRef;

  routepath: any;
  paramId: string;

  currentUser: User;

  dataForm: FormGroup;
  firstload = false;


  loading = false;
  error = '';
  msgok = '';

  progress: any;
  messages: any;

  quillStyle = {
    height: '300px'
  };
  quillviewStyle = {
    border: '0px'
  };
  quillConfig = {
    modules: {
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['link', 'image', 'video']
        ],
        handlers: {
          'image': function (image) {
            //console.log('image', image);
            if (image) {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');
              input.click();
              input.onchange = function () {
                const file = input.files[0];
                //console.log('User trying to uplaod this:', file);

                const reader = new FileReader();
                const range = this.quill.getSelection();
                const self = this;
                reader.addEventListener("load", function () {
                  // convert image file to base64 string
                  //console.log("self.quill.", self.quill);
                  // self.quill.insertEmbed(range.index, 'image', reader.result);
                  self.quill.pasteHTML(range.index, `<img class="c-img-100" src="${reader.result}"/>`);
                  //self.quill.insertEmbed(range, 'block', '<p><br></p>');
                  //self.quill.insertEmbed(range.index + 1, "break", true);
                  //self.quill.insertEmbed(range.index, 'br');
                }, false);

                if (file) {
                  reader.readAsDataURL(file);
                }

                //const id = await uploadFile(file); // I'm using react, so whatever upload function

                //const link = `${ROOT_URL}/file/${id}`;

                // this part the image is inserted
                // by 'image' option below, you just have to put src(link) of img here.

              }.bind(this);
            }
          }
        }
      }
      // toolbar: [
      //   [{ header: [1, 2, false] }],
      //   ['bold', 'italic', 'underline'],
      //   ['image', 'code-block'],
      //     {
      //       handlers: {
      //         image: (image) => {
      //           console.log('image', image);
      //         },
      //       },
      //     },
      //   ],
      // ],
    },
    theme: 'snow'  // or 'bubble'
  };

  payment_type_datas: any = [];
  shipping_type_datas: any = [];

  payment_type_default: string = '';
  shipping_type_default: string = '';

  constructor(
    private authenticationService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService,
    private fb: FormBuilder,
    public route: ActivatedRoute,
    public router: Router,
    private customerService: CustomerService,
    private shippingService: ShippingService,
    private paymentService: PaymentService,
  ) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.routepath = RouterPath;
    this.route.params.subscribe((params: Params) => {
      this.paramId = params.withId;
    });
    this.dataForm = this.fb.group({
      customer_code: ['', Validators.required],
      customer_name: ['', Validators.required],
      dealer: [''],
      phone: ['', Validators.required],
      email: [''],
      line: [''],
      customer_type: ['VAT', Validators.required],
      payment_type: ['', Validators.required],
      payment_remark: [''],
      shipping_type: ['', Validators.required],
      shipping_detail: [''],
      tax_address: [''],
      tax_id: [''],
      note: [''],
      remark: ['<p>- ใบเสนอราคามีอายุ 14 วันนับจากวันที่เปิดใบเสนอราคา<p><p>- ราคาและรายละเอียดสินค้าให้ยึดตามรายละเอียดใบเสนอราคา<p>']
    });

  }

  ngOnInit(): void {
    this.fetchData();
    this.fetchShippingData();
    this.fetchPaymentData();
  }

  get f() { return this.dataForm.controls; }

  fetchData() {
    if (this.paramId && this.paramId !== '') {
      this.firstload = true;
      this.customerService
        .getById(this.paramId)
        .subscribe((data: any) => {
          //console.log(data);
          this.f.customer_code.setValue(data.customer_code);
          this.f.customer_name.setValue(data.customer_name);
          this.f.dealer.setValue(data.dealer);
          this.f.phone.setValue(data.phone);
          this.f.email.setValue(data.email);
          this.f.line.setValue(data.line);
          this.f.customer_type.setValue(data.customer_type || 'VAT');
          this.f.payment_type.setValue(data.payment_type || this.payment_type_default);
          this.f.payment_remark.setValue(data.payment_remark);
          this.f.shipping_type.setValue(data.shipping_type || this.shipping_type_default);
          this.f.shipping_detail.setValue(data.shipping_detail);
          this.f.tax_address.setValue(data.tax_address);
          this.f.tax_id.setValue(data.tax_id)
          this.f.note.setValue(data.note)
          this.f.remark.setValue(data.remark || '<p>- ใบเสนอราคามีอายุ 14 วันนับจากวันที่เปิดใบเสนอราคา<p><p>- ราคาและรายละเอียดสินค้าให้ยึดตามรายละเอียดใบเสนอราคา<p>')

          this.firstload = false;
          this.changeDetectorRef.detectChanges();
        });
    }
  }

  fetchShippingData() {
    this.shippingService
      .findBy({
        sort:  { sequence: 1 },
        filter: {}
      })
      .subscribe((d: any) => {
        //console.log(d);
        this.shipping_type_datas = d.results;
        if( this.shipping_type_datas.length > 0 && !this.f.shipping_type.value){
          this.f.shipping_type.setValue(this.shipping_type_datas[0].title);
        }
        if(this.shipping_type_datas.length > 0){
          this.shipping_type_default = this.shipping_type_datas[0].title;
        }
        this.changeDetectorRef.detectChanges();
      });
  }

  fetchPaymentData() {
    this.paymentService
      .findBy({
        sort:  { sequence: 1 },
        filter: {}
      })
      .subscribe((d: any) => {
        //console.log(data);
        this.payment_type_datas = d.results;
        if( this.payment_type_datas.length > 0 && !this.f.payment_type.value){
          this.f.payment_type.setValue(this.payment_type_datas[0].title);
        }
        if(this.payment_type_datas.length > 0){
          this.payment_type_default = this.payment_type_datas[0].title;
        }
        // this.f.payment_type.setValue(data.payment_type);
        this.changeDetectorRef.detectChanges();
      });
  }

  onSubmit() {
    this.loading = true;
    //console.log(img);
    let shareData: any = {
      customer_code: this.f.customer_code.value,
      customer_name: this.f.customer_name.value,
      dealer: this.f.dealer.value,
      phone: this.f.phone.value,
      email: this.f.email.value,
      line: this.f.line.value,
      customer_type: this.f.customer_type.value,
      payment_type: this.f.payment_type.value,
      payment_remark: this.f.payment_remark.value,
      shipping_type: this.f.shipping_type.value,
      shipping_detail: this.f.shipping_detail.value,
      tax_address: this.f.tax_address.value,
      tax_id: this.f.tax_id.value,
      note: this.f.note.value,
      remark: this.f.remark.value,
      is_approve: true,
      modifiedby: this.currentUser.fullname,
    };

    console.log(shareData);

    let service;
    let isnew = true;
    if (this.paramId && this.paramId !== '') {
      isnew = false;
      service = this.customerService.update(this.paramId, shareData);
    } else {
      service = this.customerService.add(Object.assign(shareData, {
        createdby: this.currentUser.fullname
      }));
    }


    service.subscribe(
      (data: any) => {
        this.msgok = data.message;
        this.loading = false;
        this.decline();
        if (!isnew) {
          this.router.navigate([`/${this.routepath.customer}/${this.paramId}/view`]);
        } else {
          this.router.navigate([`/${this.routepath.customer}/${data.result._id}/view`]);
        }


        this.changeDetectorRef.detectChanges();
      },
      (error: any) => {
        this.error = error.message;
        this.loading = false;
        this.changeDetectorRef.detectChanges();
        setTimeout(() => {
          this.error = '';
          this.changeDetectorRef.detectChanges();
        }, 5000);
      });

  }

  onBackto() {
   // this.decline();
   if(this.paramId){
    this.router.navigate([`/${this.routepath.customer}/${this.paramId}/view`]);
   } else {
    this.router.navigate([`/${this.routepath.customer}`]);
   }
  }

  openModal(template: TemplateRef<any>, element?: any) {
    this.modalRef = this.modalService.show(template, { class: 'modal-xs modal-adj' });
  }
  decline(): void {
    this.modalRef.hide();
  }


}
