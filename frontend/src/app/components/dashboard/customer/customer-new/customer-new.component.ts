import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RouterPath, User } from 'src/app/_models';
import { AuthenticationService, CustomerService} from 'src/app/_services';


@Component({
  selector: 'app-customer-new',
  templateUrl: './customer-new.component.html',
  styleUrls: ['./customer-new.component.scss']
})
export class CustomerNewComponent implements OnInit {

  modalRef: BsModalRef;

  routepath: any;
  // paramId: string;

  // currentUser: User;

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

  constructor(
    // private authenticationService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService,
    private fb: FormBuilder,
    public route: ActivatedRoute,
    public router: Router,
    private customerService: CustomerService,
  ) {
    // this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.routepath = RouterPath;
    // this.route.params.subscribe((params: Params) => {
    //   this.paramId = params.withId;
    // });
    this.dataForm = this.fb.group({
      customer_name: ['', Validators.required],
      dealer: [''],
      phone: ['', Validators.required],
      email: [''],
      line: [''],
      shipping_detail: [''],
      tax_address: [''],
      tax_id: [''],
      note: ['']
    });

  }

  ngOnInit(): void {
  }

  get f() { return this.dataForm.controls; }

  onSubmit() {
    this.loading = true;
    //console.log(img);
    let shareData: any = {
      customer_name: this.f.customer_name.value,
      dealer: this.f.dealer.value,
      phone: this.f.phone.value,
      email: this.f.email.value,
      line: this.f.line.value,
      shipping_detail: this.f.shipping_detail.value,
      tax_address: this.f.tax_address.value,
      tax_id: this.f.tax_id.value,
      note: this.f.note.value,
      createdby: this.f.customer_name.value,
      modifiedby: this.f.customer_name.value,
    };

    console.log(shareData);

    let service;
    service = this.customerService.add(shareData);


    service.subscribe(
      (data: any) => {
        this.msgok = data.message;
        this.loading = false;
        this.decline();
        this.onBackto();

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
    this.router.navigate([`/${this.routepath.registercomplete}`]);
  }

  openModal(template: TemplateRef<any>, element?: any) {
    this.modalRef = this.modalService.show(template, { class: 'modal-xs modal-adj' });
  }
  decline(): void {
    this.modalRef.hide();
  }
}
