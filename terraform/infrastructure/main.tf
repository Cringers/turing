locals {
  tenancy_ocid = "ocid1.tenancy.oc1..aaaaaaaavmv2tpgifuaqnjo7xmxqtgjkbo5i7lbdoe6jhzoef6wl74hcn6wq"
}

provider "oci" {
  tenancy_ocid     = local.tenancy_ocid
  user_ocid        = "ocid1.user.oc1..aaaaaaaa7jqvwjbhlarubmfz2v6cdgjaztlbuhhalqnngsc2avt7e23dgcxa"
  private_key_path = "key.pem"
  fingerprint      = "8b:12:cd:4d:66:64:62:82:11:8c:2c:93:8c:c0:e4:81"
  region           = "us-phoenix-1"
}

data "oci_core_images" "images" {
  compartment_id = local.tenancy_ocid
}

data "template_file" "cloud-config" {
  template = <<YAML
  #cloud-config
  runcmd:
    - yum install -y oracle-instantclient-release-el8
	  - yum install -y oracle-instantclient-basic
	  - sudo sh -c "echo /usr/lib/oracle/21/client64/lib > /etc/ld.so.conf.d/oracle-instantclient.conf"
	  - sudo ldconfig
    - curl https://get.volta.sh | bash
  YAML
}

resource "oci_core_instance" "production" {
  count               = 1
  compartment_id      = local.tenancy_ocid
  availability_domain = "UHcz:PHX-AD-1"
  subnet_id           = "ocid1.subnet.oc1.phx.aaaaaaaa5osbzahgc7wye6pmwrde3motoi3sprinpzn225cux25cfe6rcawa"
  display_name        = "production"
  image               = "ocid1.image.oc1.phx.aaaaaaaa3imx2f53jbfwtl6akamfxbl2kkke74jbrek2hk5xgjvcgrw6v6fa"
  shape               = "VM.Standard.E2.1.Micro"

  metadata = {
    ssh_authorized_keys = "${file("authorized_keys")}"
    user_data           = "${base64encode(data.template_file.cloud-config.rendered)}"
  }
}
